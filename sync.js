/* ==========================================================================
 * フサキビーチリゾート 旅のお供 — 家族間データ同期(共有ID)
 *
 * キー不要の公開JSON保管サービスに1つのドキュメントを置き、
 * 端末間で「項目単位の Last-Writer-Wins」マージを行う。
 *
 *   共有ID:
 *     FB-fb-<b64url(dbHost)>-<roomKey>   Firebase RTDB(プライマリ)
 *     FB-jb-<blobId>                     jsonblob.com    (後方互換)
 *     FB-ec-<id>                         extendsclass.com(後方互換)
 *
 * ドキュメント構造:
 *   { v:1, rev:<int>, updatedAt:<iso>,
 *     trip: { start, end, updatedAt },
 *     items: { "<kind>:<id>": { kind, data:{...}, updatedAt, deleted:false } } }
 *
 * app.js からは window.FusakiSync.init(ctx) で接続する。
 * ネットワークが不調でもアプリ本体の動作を壊さないこと(失敗は静かにリトライ)。
 * ========================================================================== */
window.FusakiSync = (function () {
  'use strict';

  /* ======================================================================
   * 設定
   * ==================================================================== */

  /* ----------------------------------------------------------------------
   * Firebase Realtime Database のURL(ビルド時定数)
   *
   *   本番のデータベースURLが決まったら、下の null を文字列に書き換える。
   *     var DEFAULT_FIREBASE_HOST = 'https://xxxx-default-rtdb.firebasedatabase.app';
   *   ・末尾のスラッシュは付けない
   *   ・https:// から書く
   *   ・書き換えるのはこの1行だけでよい
   *
   * 設定するとアプリは fb プロバイダのみを使い、
   * 共有カードの「上級者設定」欄は自動的に非表示になる。
   * -------------------------------------------------------------------- */
  var DEFAULT_FIREBASE_HOST = 'https://fusaki-99945-default-rtdb.firebaseio.com';

  var REQUEST_TIMEOUT_MS = 12000;
  var POLL_INTERVAL_MS = 20000;   // 表示中のポーリング間隔
  var DEBOUNCE_MS = 2000;         // ローカル変更後のまとめ送信までの待ち
  var TOMBSTONE_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 削除マークの保持期間(60日)
  var ROOM_KEY_LENGTH = 26;       // base36 26文字 ≒ 134bit

  /** ベースURL表(テスト時は window.SYNC_ENDPOINTS で差し替え可能) */
  var DEFAULT_ENDPOINTS = {
    fb: {
      label: 'Firebase',
      path: '/rooms/'   // <host> + /rooms/ + <roomKey> + .json
    },
    jb: {
      label: 'jsonblob.com',
      create: 'https://jsonblob.com/api/jsonBlob',
      doc: 'https://jsonblob.com/api/jsonBlob/'
    },
    ec: {
      label: 'extendsclass.com',
      create: 'https://extendsclass.com/api/json-storage/bin',
      doc: 'https://extendsclass.com/api/json-storage/bin/'
    }
  };

  var ID_PREFIX = 'FB-';
  var HOST_STORE_KEY = 'firebaseHost';

  function endpoints() {
    var override = window.SYNC_ENDPOINTS;
    if (!override || typeof override !== 'object') return DEFAULT_ENDPOINTS;
    return {
      fb: override.fb || DEFAULT_ENDPOINTS.fb,
      jb: override.jb || DEFAULT_ENDPOINTS.jb,
      ec: override.ec || DEFAULT_ENDPOINTS.ec
    };
  }

  /**
   * ビルド時定数。
   * テスト用に window.SYNC_ENDPOINTS.fbHost があればそちらを優先する。
   * キーが存在すれば null / 空文字でも尊重する(= 未設定状態の再現に使える)。
   */
  function builtinFirebaseHost() {
    var override = window.SYNC_ENDPOINTS;
    if (override && Object.prototype.hasOwnProperty.call(override, 'fbHost')) {
      return override.fbHost ? normalizeHost(override.fbHost) : null;
    }
    return normalizeHost(DEFAULT_FIREBASE_HOST);
  }

  /** 「上級者設定」でユーザーが入れたURL */
  function storedFirebaseHost() {
    if (!ctx) return null;
    return normalizeHost(ctx.store.get(HOST_STORE_KEY, null));
  }

  /** 実際に使う Firebase ホスト(ビルド時定数 > ユーザー設定) */
  function activeFirebaseHost() {
    return builtinFirebaseHost() || storedFirebaseHost();
  }

  /** Firebase が使えるならそれだけ、使えないなら従来の2系統 */
  function providerOrder() {
    return activeFirebaseHost() ? ['fb'] : ['jb', 'ec'];
  }

  /** 末尾スラッシュを落として検証する。不正なら null */
  function normalizeHost(value) {
    if (!value) return null;
    var s = String(value).trim().replace(/\/+$/, '');
    if (!/^https?:\/\/[^\s/]+(\/[^\s]*)?$/.test(s)) return null;
    if (/[^\x20-\x7E]/.test(s)) return null;   // ASCII のみ(btoa のため)
    if (s.length > 300) return null;
    return s;
  }

  /* ======================================================================
   * 小物
   * ==================================================================== */

  function nowISO() {
    return new Date().toISOString();
  }

  /** updatedAt(ISO文字列 / ミリ秒数)を比較可能な数値にする */
  function tsOf(value) {
    if (value === null || value === undefined) return 0;
    var t = (typeof value === 'number') ? value : new Date(value).getTime();
    return isNaN(t) ? 0 : t;
  }

  /** キー順を固定した JSON 文字列(比較・同着判定に使う) */
  function stableString(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableString).join(',') + ']';
    var keys = Object.keys(value).sort();
    return '{' + keys.map(function (k) {
      return JSON.stringify(k) + ':' + stableString(value[k]);
    }).join(',') + '}';
  }

  function jsonOrNull(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  /** JSON の null リテラル(Firebase RTDB の「未作成」応答)かどうか */
  function isJsonNull(text) {
    return /^\s*null\s*$/.test(String(text || ''));
  }

  function headerOf(res, name) {
    try {
      var v = res.headers && res.headers.get ? res.headers.get(name) : null;
      return v ? String(v) : null;
    } catch (e) {
      return null;   // CORS で露出していないヘッダ
    }
  }

  /** 失敗理由を短い日本語にする(エラー表示用) */
  function reasonOf(err) {
    if (!err) return '不明なエラー';
    if (err.name === 'AbortError') return 'タイムアウト';
    var m = String(err.message || err);
    var http = /HTTP (\d{3})/.exec(m);
    if (http) return 'HTTP ' + http[1];
    if (/Failed to fetch|NetworkError|Load failed|ERR_/i.test(m)) return '接続不可';
    return m;
  }

  /* --- base64url(共有IDに dbHost を埋め込む) ------------------------- */

  function b64urlEncode(str) {
    try {
      return btoa(String(str)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      return null;
    }
  }

  function b64urlDecode(str) {
    try {
      var b64 = String(str).replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return atob(b64);
    } catch (e) {
      return null;
    }
  }

  /** crypto.getRandomValues による base36 ランダムキー(剰余バイアスなし) */
  function randomRoomKey() {
    var CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
    var LIMIT = 252;   // 36 * 7、これ以上の値は捨てて偏りをなくす
    var out = '';
    var pool = null;
    var poolIndex = 0;

    function nextByte() {
      if (!pool || poolIndex >= pool.length) {
        poolIndex = 0;
        try {
          if (window.crypto && window.crypto.getRandomValues) {
            pool = new Uint8Array(64);
            window.crypto.getRandomValues(pool);
          } else {
            pool = null;
          }
        } catch (e) {
          pool = null;
        }
        if (!pool) {
          // crypto が無い環境でも動くようにするための保険
          pool = [];
          for (var i = 0; i < 64; i++) pool.push(Math.floor(Math.random() * 256));
        }
      }
      return pool[poolIndex++];
    }

    while (out.length < ROOM_KEY_LENGTH) {
      var b = nextByte();
      if (b < LIMIT) out += CHARS.charAt(b % 36);
    }
    return out;
  }

  /* ======================================================================
   * 共有ID
   * ==================================================================== */

  /**
   * 共有IDを解析する。
   *   FB-fb-<b64url(host)>-<roomKey>  … host は英数と - _、roomKey は base36
   *   FB-jb-<blobId> / FB-ec-<id>     … 旧バージョンのID(後方互換)
   */
  function parseShareId(shareId) {
    var raw = String(shareId || '').trim();

    var fb = /^FB-fb-([A-Za-z0-9_-]+)-([0-9a-z]+)$/i.exec(raw);
    if (fb) {
      var host = normalizeHost(b64urlDecode(fb[1]));
      if (!host) return null;
      return {
        provider: 'fb',
        host: host,
        docId: fb[2],
        shareId: ID_PREFIX + 'fb-' + fb[1] + '-' + fb[2]
      };
    }

    var legacy = /^FB-(jb|ec)-(.+)$/i.exec(raw);
    if (legacy) {
      var provider = legacy[1].toLowerCase();
      var docId = legacy[2].trim();
      if (!docId) return null;
      return { provider: provider, host: null, docId: docId, shareId: ID_PREFIX + provider + '-' + docId };
    }

    return null;
  }

  function buildShareId(ref) {
    if (ref.provider === 'fb') {
      return ID_PREFIX + 'fb-' + b64urlEncode(ref.host) + '-' + ref.docId;
    }
    return ID_PREFIX + ref.provider + '-' + ref.docId;
  }

  function labelOf(ref) {
    var ep = endpoints()[ref.provider];
    return (ep && ep.label) || ref.provider;
  }

  /** ドキュメントのURLを組み立てる */
  function docUrl(ref) {
    if (ref.provider === 'fb') {
      var path = (endpoints().fb || {}).path || '/rooms/';
      return ref.host + path + encodeURIComponent(ref.docId) + '.json';
    }
    var ep = endpoints()[ref.provider];
    return ep.doc + encodeURIComponent(ref.docId);
  }

  /* ======================================================================
   * HTTP
   * ==================================================================== */

  function request(method, url, bodyObj) {
    if (typeof window.fetch !== 'function') {
      return Promise.reject(new Error('fetch が使えません'));
    }
    var controller = null;
    var timer = null;
    try {
      if (typeof AbortController === 'function') {
        controller = new AbortController();
        timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);
      }
    } catch (e) { /* noop */ }

    var opts = { method: method, headers: { 'Accept': 'application/json' } };
    if (bodyObj !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(bodyObj);
    }
    if (controller) opts.signal = controller.signal;

    return window.fetch(url, opts).then(function (res) {
      if (timer) clearTimeout(timer);
      return res.text().then(function (text) {
        return { ok: res.ok, status: res.status, headers: res.headers, text: text };
      });
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  /**
   * ドキュメントを取得する。
   * 戻り値: { found: bool, doc: 正規化済み, raw: 生のJSON }
   * Firebase RTDB は未作成のパスに対して 200 + null を返すので found:false 扱いにする。
   */
  function getRef(ref) {
    return request('GET', docUrl(ref)).then(function (res) {
      if (res.status === 404) return { found: false, doc: emptyDoc(), raw: null };
      if (!res.ok) throw new Error(labelOf(ref) + ': HTTP ' + res.status);
      if (isJsonNull(res.text)) return { found: false, doc: emptyDoc(), raw: null };
      var body = jsonOrNull(res.text);
      if (body === null) throw new Error(labelOf(ref) + ': JSONを解釈できませんでした');
      return { found: true, doc: normalizeDoc(body), raw: body };
    });
  }

  function putRef(ref, doc) {
    return request('PUT', docUrl(ref), doc).then(function (res) {
      if (!res.ok) throw new Error(labelOf(ref) + ': HTTP ' + res.status);
      return true;
    });
  }

  /** 同期サイクル用。存在しなければ空ドキュメント扱い(次のPUTで復旧する) */
  function loadDoc(ref) {
    return getRef(ref).then(function (r) { return r.doc; });
  }

  /** 参加・作成確認用。「200 かつ v:1 のドキュメント」であることを要求する */
  function requireDoc(ref) {
    return getRef(ref).then(function (r) {
      if (!r.found) throw new Error(labelOf(ref) + ': 共有データが見つかりません');
      if (!r.raw || typeof r.raw !== 'object' || r.raw.v !== 1) {
        throw new Error(labelOf(ref) + ': 共有データの形式が違います');
      }
      return r.doc;
    });
  }

  /* ======================================================================
   * 作成
   * ==================================================================== */

  /**
   * jsonblob の POST レスポンスから blobId を取り出す。
   * CORS 環境では Location ヘッダが読めないことがあるため
   * X-jsonblob → Location → レスポンスボディ の順に試す。
   */
  function extractJsonblobId(res) {
    var x = headerOf(res, 'X-jsonblob');
    if (x && x.trim()) return lastSegment(x.trim());

    var loc = headerOf(res, 'Location');
    if (loc && loc.trim()) return lastSegment(loc.trim());

    var body = jsonOrNull(res.text);
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      if (typeof body.id === 'string' && body.id) return body.id;
      if (typeof body.blobId === 'string' && body.blobId) return body.blobId;
    }
    var raw = String(res.text || '').trim().replace(/^"|"$/g, '');
    if (/^[A-Za-z0-9_-]{6,}$/.test(raw)) return raw;

    return null;
  }

  function lastSegment(url) {
    var seg = String(url).split('#')[0].split('?')[0].replace(/\/+$/, '').split('/').pop();
    return seg || null;
  }

  /** Firebase RTDB: 空きキーを探して PUT → 読み戻し確認 */
  function createOnFirebase(doc, attempt) {
    var host = activeFirebaseHost();
    if (!host) {
      return Promise.reject(new Error('Firebase: データベースURLが未設定です'));
    }
    attempt = attempt || 0;
    var ref = { provider: 'fb', host: host, docId: randomRoomKey() };

    // まず未使用のキーであることを確認する(衝突はまず起きないが念のため)
    return getRef(ref).then(function (existing) {
      if (existing.found) {
        if (attempt >= 3) throw new Error('Firebase: 空きキーを確保できませんでした');
        return createOnFirebase(doc, attempt + 1);
      }
      return putRef(ref, doc)
        .then(function () { return requireDoc(ref); })
        .then(function () { return ref; });
    });
  }

  /** jsonblob / extendsclass: POST で作成 → 読み戻し確認 */
  function createOnLegacy(provider, doc) {
    var ep = endpoints()[provider];
    return request('POST', ep.create, doc).then(function (res) {
      if (!res.ok) throw new Error(ep.label + ': HTTP ' + res.status);
      var id;
      if (provider === 'jb') {
        id = extractJsonblobId(res);
      } else {
        var body = jsonOrNull(res.text);
        id = (body && typeof body.id === 'string') ? body.id : null;
      }
      if (!id) throw new Error(ep.label + ': IDを取得できませんでした');
      var ref = { provider: provider, host: null, docId: id };
      // 読み戻せることまで確認してから共有IDとして採用する
      return requireDoc(ref).then(function () { return ref; });
    });
  }

  function createOnProvider(provider, doc) {
    return provider === 'fb' ? createOnFirebase(doc) : createOnLegacy(provider, doc);
  }

  /* ======================================================================
   * ドキュメントのマージ
   * ==================================================================== */

  function emptyDoc() {
    return { v: 1, rev: 0, updatedAt: nowISO(), trip: null, items: {} };
  }

  /** 何が返ってきても壊れないように整形する */
  function normalizeDoc(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyDoc();
    var doc = emptyDoc();
    doc.rev = (typeof raw.rev === 'number' && isFinite(raw.rev)) ? raw.rev : 0;
    doc.updatedAt = raw.updatedAt || doc.updatedAt;

    if (raw.trip && typeof raw.trip === 'object' && raw.trip.start) {
      doc.trip = {
        start: String(raw.trip.start),
        end: raw.trip.end ? String(raw.trip.end) : String(raw.trip.start),
        updatedAt: raw.trip.updatedAt || doc.updatedAt
      };
    }

    if (raw.items && typeof raw.items === 'object' && !Array.isArray(raw.items)) {
      Object.keys(raw.items).forEach(function (key) {
        var rec = raw.items[key];
        if (!rec || typeof rec !== 'object') return;
        if (key.indexOf(':') < 1) return;
        doc.items[key] = {
          kind: String(rec.kind || key.split(':')[0]),
          data: (rec.data && typeof rec.data === 'object') ? rec.data : {},
          updatedAt: rec.updatedAt || doc.updatedAt,
          deleted: !!rec.deleted
        };
      });
    }
    return doc;
  }

  /** 同着でも両端末で同じ結果になるように決定的に選ぶ */
  function pickNewer(a, b) {
    if (!a) return b;
    if (!b) return a;
    var ta = tsOf(a.updatedAt);
    var tb = tsOf(b.updatedAt);
    if (ta > tb) return a;
    if (tb > ta) return b;
    return stableString(a) >= stableString(b) ? a : b;
  }

  /** ローカルとリモートを項目単位 LWW でマージ(常に和集合ベース) */
  function mergeDocs(local, remote) {
    var merged = {
      v: 1,
      rev: remote.rev || 0,
      updatedAt: nowISO(),
      trip: pickNewerTrip(local.trip, remote.trip),
      items: {}
    };
    var keys = {};
    Object.keys(local.items || {}).forEach(function (k) { keys[k] = 1; });
    Object.keys(remote.items || {}).forEach(function (k) { keys[k] = 1; });
    Object.keys(keys).forEach(function (k) {
      merged.items[k] = pickNewer(local.items[k], remote.items[k]);
    });
    return merged;
  }

  function pickNewerTrip(a, b) {
    if (!a) return b || null;
    if (!b) return a;
    return tsOf(a.updatedAt) >= tsOf(b.updatedAt) ? a : b;
  }

  /** マージ結果がリモートと違う(= 送るべき差分がある)か */
  function differsFromRemote(merged, remote) {
    return stableString({ t: merged.trip || null, i: merged.items }) !==
           stableString({ t: remote.trip || null, i: remote.items || {} });
  }

  /* ======================================================================
   * 状態
   * ==================================================================== */

  var ctx = null;
  var meta = { shareId: null, ref: null, lastSyncedAt: null, rev: 0 };
  var status = 'off';           // off | connecting | synced | offline
  var lastError = null;
  var running = false;
  var runAgain = false;
  var debounceTimer = null;
  var pollTimer = null;
  var started = false;

  function setStatus(next, err) {
    lastError = err || null;
    if (status === next && !err) return;
    status = next;
    emit();
  }

  function emit() {
    if (ctx && typeof ctx.onStatus === 'function') {
      try { ctx.onStatus(getState()); } catch (e) { /* 描画側の失敗で同期を壊さない */ }
    }
  }

  function getState() {
    return {
      connected: !!meta.shareId,
      shareId: meta.shareId,
      provider: meta.ref ? meta.ref.provider : null,
      providerLabel: meta.ref ? labelOf(meta.ref) : null,
      host: meta.ref ? meta.ref.host : null,
      status: status,
      lastSyncedAt: meta.lastSyncedAt,
      rev: meta.rev,
      error: lastError
    };
  }

  /** 共有カードの「上級者設定」用 */
  function getConfig() {
    return {
      firebaseHost: activeFirebaseHost(),
      storedHost: storedFirebaseHost(),
      builtinHost: builtinFirebaseHost(),
      // ビルド時定数があるならユーザーに設定させる必要はない
      canConfigure: !builtinFirebaseHost(),
      providers: providerOrder()
    };
  }

  function saveMeta() {
    if (!ctx) return;
    ctx.store.set('sync', {
      shareId: meta.shareId,
      lastSyncedAt: meta.lastSyncedAt,
      rev: meta.rev
    });
  }

  function loadMeta() {
    var saved = ctx.store.get('sync', null);
    if (!saved || !saved.shareId) return;
    var parsed = parseShareId(saved.shareId);
    if (!parsed) return;
    meta.shareId = parsed.shareId;
    meta.ref = { provider: parsed.provider, host: parsed.host, docId: parsed.docId };
    meta.lastSyncedAt = saved.lastSyncedAt || null;
    meta.rev = saved.rev || 0;
  }

  function adopt(ref, rev) {
    meta.ref = ref;
    meta.shareId = buildShareId(ref);
    meta.rev = rev || 0;
    meta.lastSyncedAt = nowISO();
    saveMeta();
  }

  /* ======================================================================
   * 同期サイクル
   * ==================================================================== */

  /**
   * GET → マージ →(差分があれば)PUT → ローカル反映
   * 失敗しても例外を投げず、status を offline にするだけ。
   */
  function syncNow() {
    if (!meta.shareId || !ctx) return Promise.resolve(false);
    if (running) { runAgain = true; return Promise.resolve(false); }
    running = true;
    if (status !== 'synced') setStatus('connecting');

    var ref = meta.ref;

    return loadDoc(ref)
      .then(function (remote) {
        var local = normalizeDoc(ctx.buildLocalDoc());
        var merged = mergeDocs(local, remote);
        var needsPush = differsFromRemote(merged, remote);

        if (!needsPush) {
          finishSync(remote.rev || 0);
          applySafely(merged);
          return false;
        }
        merged.rev = (remote.rev || 0) + 1;
        return putRef(ref, merged).then(function () {
          finishSync(merged.rev);
          applySafely(merged);
          return true;
        });
      })
      .catch(function (err) {
        setStatus('offline', reasonOf(err));
        return false;
      })
      .then(function (result) {
        running = false;
        if (runAgain) {
          runAgain = false;
          setTimeout(syncNow, 0);
        }
        return result;
      });
  }

  function finishSync(rev) {
    meta.rev = rev;
    meta.lastSyncedAt = nowISO();
    saveMeta();
    setStatus('synced');
  }

  function applySafely(doc) {
    try {
      ctx.applyDoc(doc);
    } catch (e) {
      // 反映に失敗してもローカルデータは触らない
    }
  }

  /* ======================================================================
   * トリガー
   * ==================================================================== */

  function scheduleDebounced() {
    if (!meta.shareId) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      syncNow();
    }, DEBOUNCE_MS);
  }

  function startPolling() {
    stopPolling();
    if (!meta.shareId) return;
    pollTimer = setInterval(function () {
      if (document.visibilityState === 'hidden') return;
      syncNow();
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  function onVisible() {
    if (document.visibilityState === 'visible' && meta.shareId) syncNow();
  }

  function startTriggers() {
    if (started) return;
    started = true;
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', function () { if (meta.shareId) syncNow(); });
  }

  /* ======================================================================
   * 公開API
   * ==================================================================== */

  var API = {
    /** app.js から接続する。ctx = { store, buildLocalDoc, applyDoc, onStatus } */
    init: function (context) {
      ctx = context;
      loadMeta();
      startTriggers();
      if (meta.shareId) {
        setStatus('connecting');
        startPolling();
        syncNow();
      } else {
        setStatus('off');
      }
      return getState();
    },

    getState: getState,
    getConfig: getConfig,
    parseShareId: parseShareId,

    /**
     * 「上級者設定」でデータベースURLを保存する。
     * 空文字を渡すと設定を削除する。戻り値は正規化後のURL(不正なら false)。
     */
    setFirebaseHost: function (value) {
      if (!ctx) return false;
      var raw = String(value === null || value === undefined ? '' : value).trim();
      if (!raw) {
        ctx.store.remove(HOST_STORE_KEY);
        emit();
        return null;
      }
      var host = normalizeHost(raw);
      if (!host) return false;
      ctx.store.set(HOST_STORE_KEY, host);
      emit();
      return host;
    },

    /**
     * 共有を新規作成する。
     * Firebase が設定されていれば fb のみ、無ければ jsonblob → extendsclass。
     * 失敗時の reject には details(プロバイダごとの理由)を付ける。
     */
    create: function () {
      if (!ctx) return Promise.reject(new Error('未初期化です'));
      var initial = normalizeDoc(ctx.buildLocalDoc());
      initial.rev = 1;
      initial.updatedAt = nowISO();

      setStatus('connecting');
      var order = providerOrder();
      var details = [];

      var attempt = function (index) {
        if (index >= order.length) {
          setStatus(meta.shareId ? 'synced' : 'off');
          var summary = details.map(function (d) { return d.label + ': ' + d.reason; }).join(' / ');
          var err = new Error(summary || '共有IDを作成できませんでした');
          err.details = details;
          return Promise.reject(err);
        }
        var provider = order[index];
        return createOnProvider(provider, initial).then(function (ref) {
          adopt(ref, 1);
          setStatus('synced');
          startPolling();
          syncNow();
          return getState();
        }, function (err) {
          details.push({
            provider: provider,
            label: (endpoints()[provider] || {}).label || provider,
            reason: reasonOf(err)
          });
          return attempt(index + 1);
        });
      };
      return attempt(0);
    },

    /** 既存の共有に参加する。GETで存在確認してからマージを始める。 */
    join: function (shareId) {
      if (!ctx) return Promise.reject(new Error('未初期化です'));
      var parsed = parseShareId(shareId);
      if (!parsed) {
        return Promise.reject(new Error('共有IDの形式が正しくありません'));
      }
      var ref = { provider: parsed.provider, host: parsed.host, docId: parsed.docId };
      setStatus('connecting');
      return requireDoc(ref).then(function () {
        meta.ref = ref;
        meta.shareId = parsed.shareId;
        meta.rev = 0;
        meta.lastSyncedAt = null;
        saveMeta();
        startPolling();
        return syncNow().then(function () { return getState(); });
      }, function (err) {
        setStatus(meta.shareId ? 'offline' : 'off');
        throw err;
      });
    },

    /** 共有を解除する。ローカルデータはそのまま残す。 */
    leave: function () {
      meta = { shareId: null, ref: null, lastSyncedAt: null, rev: 0 };
      if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
      stopPolling();
      if (ctx) ctx.store.remove('sync');
      setStatus('off');
      return getState();
    },

    /** 「接続テスト」ボタン用。到達できたかを返す。 */
    test: function () {
      if (!meta.shareId) return Promise.resolve(false);
      setStatus('connecting');
      return loadDoc(meta.ref).then(function () {
        return syncNow().then(function () { return true; });
      }, function (err) {
        setStatus('offline', reasonOf(err));
        return false;
      });
    },

    /** ローカル変更の通知(2秒デバウンスして送信) */
    notifyChange: function () {
      scheduleDebounced();
    },

    syncNow: syncNow,

    /** 削除マークの間引き(app.js から呼ぶ) */
    tombstoneTtlMs: TOMBSTONE_TTL_MS,

    /* テスト・デバッグ用に内部関数も公開する */
    _internals: {
      mergeDocs: mergeDocs,
      normalizeDoc: normalizeDoc,
      pickNewer: pickNewer,
      stableString: stableString,
      extractJsonblobId: extractJsonblobId,
      endpoints: endpoints,
      buildShareId: buildShareId,
      docUrl: docUrl,
      randomRoomKey: randomRoomKey,
      b64urlEncode: b64urlEncode,
      b64urlDecode: b64urlDecode,
      normalizeHost: normalizeHost,
      providerOrder: providerOrder
    }
  };

  return API;
})();
