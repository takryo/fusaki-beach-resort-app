/* ==========================================================================
 * フサキビーチリゾート 旅のお供 — 家族間データ同期(共有ID)
 *
 * キー不要の公開JSON保管サービスに1つのドキュメントを置き、
 * 端末間で「項目単位の Last-Writer-Wins」マージを行う。
 *
 *   共有ID: FB-jb-<blobId>  (jsonblob.com / プライマリ)
 *           FB-ec-<id>      (extendsclass.com / フォールバック)
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

  /* --- 定数 ----------------------------------------------------------- */

  var REQUEST_TIMEOUT_MS = 12000;
  var POLL_INTERVAL_MS = 20000;   // 表示中のポーリング間隔
  var DEBOUNCE_MS = 2000;         // ローカル変更後のまとめ送信までの待ち
  var TOMBSTONE_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 削除マークの保持期間(60日)

  /** ベースURL表(テスト時は window.SYNC_ENDPOINTS で差し替え可能) */
  var DEFAULT_ENDPOINTS = {
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

  /** 新規作成時に試すプロバイダの順番(プライマリ → フォールバック) */
  var PROVIDER_ORDER = ['jb', 'ec'];

  var ID_PREFIX = 'FB-';

  function endpoints() {
    var override = window.SYNC_ENDPOINTS;
    if (!override || typeof override !== 'object') return DEFAULT_ENDPOINTS;
    return {
      jb: override.jb || DEFAULT_ENDPOINTS.jb,
      ec: override.ec || DEFAULT_ENDPOINTS.ec
    };
  }

  /* --- 小物 ------------------------------------------------------------ */

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

  function headerOf(res, name) {
    try {
      var v = res.headers && res.headers.get ? res.headers.get(name) : null;
      return v ? String(v) : null;
    } catch (e) {
      return null;   // CORS で露出していないヘッダ
    }
  }

  /* --- 共有ID ---------------------------------------------------------- */

  function parseShareId(shareId) {
    var m = /^FB-(jb|ec)-(.+)$/i.exec(String(shareId || '').trim());
    if (!m) return null;
    var provider = m[1].toLowerCase();
    var docId = m[2].trim();
    if (!docId) return null;
    return { provider: provider, docId: docId, shareId: ID_PREFIX + provider + '-' + docId };
  }

  function buildShareId(provider, docId) {
    return ID_PREFIX + provider + '-' + docId;
  }

  /* --- HTTP ------------------------------------------------------------ */

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

  function createOnProvider(provider, doc) {
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
      // 読み戻せることまで確認してから共有IDとして採用する
      return fetchDoc(provider, id).then(function () { return id; });
    });
  }

  function fetchDoc(provider, docId) {
    var ep = endpoints()[provider];
    return request('GET', ep.doc + encodeURIComponent(docId)).then(function (res) {
      if (!res.ok) throw new Error(ep.label + ': HTTP ' + res.status);
      var body = jsonOrNull(res.text);
      if (body === null) throw new Error(ep.label + ': JSONを解釈できませんでした');
      return normalizeDoc(body);
    });
  }

  function putDoc(provider, docId, doc) {
    var ep = endpoints()[provider];
    return request('PUT', ep.doc + encodeURIComponent(docId), doc).then(function (res) {
      if (!res.ok) throw new Error(ep.label + ': HTTP ' + res.status);
      return true;
    });
  }

  /* --- ドキュメント --------------------------------------------------- */

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

  /* --- 状態 ------------------------------------------------------------ */

  var ctx = null;
  var meta = { shareId: null, provider: null, docId: null, lastSyncedAt: null, rev: 0 };
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
      provider: meta.provider,
      providerLabel: meta.provider ? (endpoints()[meta.provider] || {}).label || meta.provider : null,
      status: status,
      lastSyncedAt: meta.lastSyncedAt,
      rev: meta.rev,
      error: lastError
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
    meta.provider = parsed.provider;
    meta.docId = parsed.docId;
    meta.lastSyncedAt = saved.lastSyncedAt || null;
    meta.rev = saved.rev || 0;
  }

  /* --- 同期サイクル ---------------------------------------------------- */

  /**
   * GET → マージ →(差分があれば)PUT → ローカル反映
   * 失敗しても例外を投げず、status を offline にするだけ。
   */
  function syncNow() {
    if (!meta.shareId || !ctx) return Promise.resolve(false);
    if (running) { runAgain = true; return Promise.resolve(false); }
    running = true;
    if (status !== 'synced') setStatus('connecting');

    var provider = meta.provider;
    var docId = meta.docId;

    return fetchDoc(provider, docId)
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
        return putDoc(provider, docId, merged).then(function () {
          finishSync(merged.rev);
          applySafely(merged);
          return true;
        });
      })
      .catch(function (err) {
        setStatus('offline', err && err.message ? err.message : String(err));
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

  /* --- トリガー -------------------------------------------------------- */

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

  /* --- 公開API --------------------------------------------------------- */

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

    parseShareId: parseShareId,

    /** 共有を新規作成する。jsonblob → extendsclass の順に試す。 */
    create: function () {
      if (!ctx) return Promise.reject(new Error('未初期化です'));
      var initial = normalizeDoc(ctx.buildLocalDoc());
      initial.rev = 1;
      initial.updatedAt = nowISO();

      setStatus('connecting');
      var errors = [];

      var attempt = function (index) {
        if (index >= PROVIDER_ORDER.length) {
          setStatus(meta.shareId ? 'synced' : 'off');
          return Promise.reject(new Error(errors.join(' / ') || '共有IDを作成できませんでした'));
        }
        var provider = PROVIDER_ORDER[index];
        return createOnProvider(provider, initial).then(function (docId) {
          meta.provider = provider;
          meta.docId = docId;
          meta.shareId = buildShareId(provider, docId);
          meta.rev = 1;
          meta.lastSyncedAt = nowISO();
          saveMeta();
          setStatus('synced');
          startPolling();
          syncNow();
          return getState();
        }, function (err) {
          errors.push(err && err.message ? err.message : String(err));
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
      setStatus('connecting');
      return fetchDoc(parsed.provider, parsed.docId).then(function () {
        meta.provider = parsed.provider;
        meta.docId = parsed.docId;
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
      meta = { shareId: null, provider: null, docId: null, lastSyncedAt: null, rev: 0 };
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
      return fetchDoc(meta.provider, meta.docId).then(function () {
        return syncNow().then(function () { return true; });
      }, function (err) {
        setStatus('offline', err && err.message ? err.message : String(err));
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
      endpoints: endpoints
    }
  };

  return API;
})();
