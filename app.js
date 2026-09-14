/* ==========================================================================
 * フサキビーチリゾート 旅のお供
 * バニラJSのシングルページアプリ。ビルド不要・外部ライブラリなし。
 *
 * 構成:
 *   1. ユーティリティ
 *   2. ストレージ(localStorage の安全なラッパー)
 *   3. アプリ状態
 *   4. 天気(Open-Meteo)
 *   5. 各タブの描画
 *   6. イベント処理
 *   7. 起動
 * ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
   * 1. ユーティリティ
   * ==================================================================== */

  var WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /** HTML エスケープ(テキスト・属性値の両方で使用) */
  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** 外部リンクとして安全に使える URL だけを通す */
  function safeUrl(url) {
    if (!url) return null;
    var s = String(url).trim();
    return /^https?:\/\//i.test(s) ? s : null;
  }

  /** tel: リンク用に数字と + - のみ残す */
  function telHref(tel) {
    if (!tel) return null;
    var s = String(tel).replace(/[^\d+\-]/g, '');
    return s ? 'tel:' + s : null;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /** 同期の更新時刻に使う ISO 文字列 */
  function nowISO() {
    return new Date().toISOString();
  }

  /* --- 日付ヘルパー(すべてローカルタイム基準の YYYY-MM-DD 文字列) ----- */

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function toISODate(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  /** 'YYYY-MM-DD' → ローカルの Date(不正なら null) */
  function parseISODate(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    var p = iso.split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  function todayISO() {
    return toISODate(new Date());
  }

  function addDaysISO(iso, days) {
    var d = parseISODate(iso);
    if (!d) return iso;
    d.setDate(d.getDate() + days);
    return toISODate(d);
  }

  /** 日数の差(b - a)。どちらかが不正なら null */
  function diffDays(aISO, bISO) {
    var a = parseISODate(aISO);
    var b = parseISODate(bISO);
    if (!a || !b) return null;
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  /** 'YYYY-MM-DD' → '9月14日(日)' */
  function formatDateLong(iso) {
    var d = parseISODate(iso);
    if (!d) return iso || '';
    return (d.getMonth() + 1) + '月' + d.getDate() + '日(' + WEEKDAYS[d.getDay()] + ')';
  }

  /** 'YYYY-MM-DD' → '9/14' */
  function formatDateShort(iso) {
    var d = parseISODate(iso);
    if (!d) return iso || '';
    return (d.getMonth() + 1) + '/' + d.getDate();
  }

  function weekdayOf(iso) {
    var d = parseISODate(iso);
    return d ? WEEKDAYS[d.getDay()] : '';
  }

  /** '2026-09-14T18:45' のような時刻文字列から 'HH:MM' を取り出す */
  function timeOfISO(isoDateTime) {
    if (!isoDateTime) return null;
    var m = String(isoDateTime).match(/T(\d{2}:\d{2})/);
    return m ? m[1] : null;
  }

  /** '2026-09-14T18:45' → その日の 0:00 からの経過分 */
  function minutesOfISO(isoDateTime) {
    var hm = timeOfISO(isoDateTime);
    if (!hm) return null;
    var p = hm.split(':');
    return Number(p[0]) * 60 + Number(p[1]);
  }

  function formatUpdatedAt(ts) {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  /* --- トースト -------------------------------------------------------- */

  var toastTimer = null;

  function toast(message) {
    var node = $('#toast');
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    // 次フレームでクラスを付けてトランジションさせる
    requestAnimationFrame(function () {
      node.classList.add('is-visible');
    });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      node.classList.remove('is-visible');
      setTimeout(function () { node.hidden = true; }, 220);
    }, 1900);
  }

  /* ======================================================================
   * 2. ストレージ(localStorage が使えない環境でも落ちない)
   * ==================================================================== */

  var PREFIX = 'fusaki.';
  var memoryStore = {};          // localStorage が使えない場合のフォールバック
  var storageAvailable = (function () {
    try {
      var k = PREFIX + '__test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  })();

  var store = {
    get: function (key, fallback) {
      try {
        var raw = storageAvailable
          ? window.localStorage.getItem(PREFIX + key)
          : (Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null);
        if (raw === null || raw === undefined) return fallback;
        var parsed = JSON.parse(raw);
        return parsed === null || parsed === undefined ? fallback : parsed;
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        var raw = JSON.stringify(value);
        if (storageAvailable) {
          window.localStorage.setItem(PREFIX + key, raw);
        } else {
          memoryStore[key] = raw;
        }
        return true;
      } catch (e) {
        // 容量超過・プライベートモード等。メモリにだけ退避して続行する
        try { memoryStore[key] = JSON.stringify(value); } catch (e2) { /* noop */ }
        return false;
      }
    },
    remove: function (key) {
      try {
        if (storageAvailable) window.localStorage.removeItem(PREFIX + key);
        delete memoryStore[key];
      } catch (e) { /* noop */ }
    }
  };

  /* ======================================================================
   * 3. アプリ状態
   * ==================================================================== */

  var CHECKLIST_TEMPLATE = [
    // 持ち物(ビーチリゾート・大人旅行向け)
    { sec: 'pack', text: '水着' },
    { sec: 'pack', text: 'ラッシュガード' },
    { sec: 'pack', text: 'ビーチサンダル' },
    { sec: 'pack', text: '日焼け止め(SPF50+・耐水)' },
    { sec: 'pack', text: 'アフターサンケア / 保湿剤' },
    { sec: 'pack', text: 'サングラス' },
    { sec: 'pack', text: '帽子(つば広)' },
    { sec: 'pack', text: '虫除けスプレー' },
    { sec: 'pack', text: '酔い止め(船・車)' },
    { sec: 'pack', text: '常備薬・絆創膏' },
    { sec: 'pack', text: 'モバイルバッテリー' },
    { sec: 'pack', text: '充電ケーブル・充電器' },
    { sec: 'pack', text: '防水スマホケース' },
    { sec: 'pack', text: 'ビーチバッグ' },
    { sec: 'pack', text: '速乾タオル' },
    { sec: 'pack', text: '羽織もの(冷房・日よけ)' },
    { sec: 'pack', text: '濡れ物用ジップ袋・圧縮袋' },
    { sec: 'pack', text: '洗面用具・スキンケア' },
    { sec: 'pack', text: '現金(小額紙幣)' },
    { sec: 'pack', text: 'クレジットカード・身分証' },
    { sec: 'pack', text: '折りたたみ傘' },
    { sec: 'pack', text: 'エコバッグ' },
    // やること
    { sec: 'todo', text: '往路のオンラインチェックイン' },
    { sec: 'todo', text: '復路のオンラインチェックイン' },
    { sec: 'todo', text: 'ホテルへの送迎・バス時刻の確認' },
    { sec: 'todo', text: 'レストランの予約' },
    { sec: 'todo', text: 'アクティビティ(シュノーケル等)の予約' },
    { sec: 'todo', text: '直前の天気・海況チェック' },
    { sec: 'todo', text: 'スマホの空き容量とバックアップ' },
    { sec: 'todo', text: '自宅の戸締まり・ゴミ出し' },
    { sec: 'todo', text: 'お土産リストの最終確認' }
  ];

  /**
   * テンプレート項目の id は端末によらず同じにする。
   * こうしないと共有に参加したときに同じ持ち物が二重に増えてしまう。
   */
  function templateId(index) {
    return 'tpl-' + pad2(index);
  }

  function buildChecklistTemplate() {
    return CHECKLIST_TEMPLATE.map(function (t, i) {
      return { id: templateId(i), sec: t.sec, text: t.text, done: false, updatedAt: nowISO() };
    });
  }

  function defaultTrip() {
    var start = todayISO();
    return { start: start, end: addDaysISO(start, 3), updatedAt: nowISO() };
  }

  var state = {
    tab: 'home',
    trip: store.get('trip', null) || defaultTrip(),
    schedule: store.get('schedule', []),
    checklist: store.get('checklist', null),
    notes: store.get('notes', []),
    souvenirs: store.get('souvenirs', []),
    tombstones: store.get('tombstones', {}),  // "<kind>:<id>" → 削除時刻(同期用)
    weather: { status: 'idle', data: null }   // idle | loading | ok | error
  };

  if (!Array.isArray(state.checklist)) {
    state.checklist = buildChecklistTemplate();
    store.set('checklist', state.checklist);
  }
  if (!Array.isArray(state.schedule)) state.schedule = [];
  if (!Array.isArray(state.notes)) state.notes = [];
  if (!Array.isArray(state.souvenirs)) state.souvenirs = [];
  if (!state.tombstones || typeof state.tombstones !== 'object') state.tombstones = {};

  /** 描画のみに使う一時的な UI 状態(保存しない) */
  var ui = {
    tripEditing: false,
    scheduleForm: null,   // null | { id: string|null, date, time, title, note }
    noteForm: null,       // null | { id: string|null, title, body }
    souvenirFormOpen: false,
    openCategories: {},   // リゾート情報アコーディオンの開閉
    poiForm: null,        // null | { cat, name, from } … 施設カード内の「予定に追加」フォーム
    mapPin: null,         // 館内マップで選択中のピン番号
    openPoi: {},          // 予定id → 施設情報を展開中か
    shareJoinOpen: false, // 「共有IDを入力して参加」欄の開閉
    shareError: null,     // 共有カードのインラインエラー
    shareErrorDetail: null, // 失敗したプロバイダと理由(原因調査用の一行)
    shareAdvancedOpen: false, // 「上級者設定」の開閉
    shareBusy: null       // 実行中の共有操作 ('create' | 'join' | 'test')
  };

  /** 同期からの反映中は、保存フックで同期を呼び返さないようにする */
  var suppressSync = false;

  function save(key) {
    store.set(key, state[key]);
    if (!suppressSync) Sync.notifyChange();
  }

  /* --- 同期用マイグレーション ------------------------------------------
   * 既存データに updatedAt を付け、テンプレート項目の id を共通化する。
   * ------------------------------------------------------------------- */

  function migrateForSync() {
    var stamp = nowISO();
    var touched = {};

    ['schedule', 'checklist', 'notes', 'souvenirs'].forEach(function (key) {
      state[key].forEach(function (item) {
        if (!item.id) { item.id = uid(); touched[key] = true; }
        if (!item.updatedAt) { item.updatedAt = stamp; touched[key] = true; }
      });
    });

    // 旧バージョンのランダムidのテンプレート項目を、共通idに寄せる
    var byText = {};
    CHECKLIST_TEMPLATE.forEach(function (t, i) { byText[t.sec + ':' + t.text] = templateId(i); });
    var used = {};
    state.checklist.forEach(function (item) { used[item.id] = true; });
    state.checklist.forEach(function (item) {
      if (/^tpl-\d+$/.test(item.id)) return;
      var want = byText[item.sec + ':' + item.text];
      if (want && !used[want]) {
        delete used[item.id];
        item.id = want;
        used[want] = true;
        touched.checklist = true;
      }
    });

    if (!state.trip.updatedAt) { state.trip.updatedAt = stamp; touched.trip = true; }

    // 古い削除マークを間引く(無制限に溜めない)
    var ttl = (window.FusakiSync && window.FusakiSync.tombstoneTtlMs) || 5184000000;
    var cutoff = Date.now() - ttl;
    Object.keys(state.tombstones).forEach(function (k) {
      var t = new Date(state.tombstones[k]).getTime();
      if (!t || isNaN(t) || t < cutoff) { delete state.tombstones[k]; touched.tombstones = true; }
    });

    suppressSync = true;
    Object.keys(touched).forEach(function (key) { save(key); });
    suppressSync = false;
  }

  /** 削除を同期できるように墓標(tombstone)を残す */
  function markDeleted(kind, id) {
    state.tombstones[kind + ':' + id] = nowISO();
    save('tombstones');
  }

  /* ======================================================================
   * 4. 天気(Open-Meteo / APIキー不要)
   * ==================================================================== */

  var WEATHER_URL =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=24.366&longitude=124.113' +
    '&current=temperature_2m,weather_code,wind_speed_10m,precipitation' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset' +
    '&timezone=Asia%2FTokyo&forecast_days=7';

  /** WMO weather code → 絵文字と日本語 */
  var WMO = {
    0:  ['☀️', '快晴'],
    1:  ['🌤', 'おおむね晴れ'],
    2:  ['⛅', '薄曇り'],
    3:  ['☁️', 'くもり'],
    45: ['🌫', '霧'],
    48: ['🌫', '霧氷の霧'],
    51: ['🌦', '弱い霧雨'],
    53: ['🌦', '霧雨'],
    55: ['🌧', '強い霧雨'],
    56: ['🌧', '凍る霧雨'],
    57: ['🌧', '強い凍る霧雨'],
    61: ['🌦', '弱い雨'],
    63: ['🌧', '雨'],
    65: ['🌧', '強い雨'],
    66: ['🌧', '凍雨'],
    67: ['🌧', '強い凍雨'],
    71: ['🌨', '弱い雪'],
    73: ['🌨', '雪'],
    75: ['❄️', '強い雪'],
    77: ['❄️', '霧雪'],
    80: ['🌦', 'にわか雨'],
    81: ['🌧', '強いにわか雨'],
    82: ['⛈', '激しいにわか雨'],
    85: ['🌨', 'にわか雪'],
    86: ['🌨', '強いにわか雪'],
    95: ['⛈', '雷雨'],
    96: ['⛈', '雷雨(ひょう)'],
    99: ['⛈', '激しい雷雨(ひょう)']
  };

  function wmoInfo(code) {
    return WMO[code] || ['🌈', '—'];
  }

  function loadWeather() {
    if (typeof window.fetch !== 'function') {
      state.weather = { status: 'error', data: null };
      if (state.tab === 'home') renderHome();
      return;
    }
    state.weather = { status: 'loading', data: null };
    if (state.tab === 'home') renderHome();

    var controller = null;
    var timer = null;
    try {
      if (typeof AbortController === 'function') {
        controller = new AbortController();
        timer = setTimeout(function () { controller.abort(); }, 12000);
      }
    } catch (e) { /* noop */ }

    window.fetch(WEATHER_URL, controller ? { signal: controller.signal } : undefined)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        if (timer) clearTimeout(timer);
        if (!json || !json.daily || !json.daily.time) throw new Error('unexpected payload');
        state.weather = { status: 'ok', data: json };
        if (state.tab === 'home') renderHome();
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        // 失敗しても例外にせず、再試行できる状態にするだけ
        state.weather = { status: 'error', data: null };
        if (state.tab === 'home') renderHome();
      });
  }

  /* ======================================================================
   * 4.5 家族と共有(sync.js との受け渡し)
   * ==================================================================== */

  /** sync.js が無い環境でもアプリが動くようにしたフォールバック */
  var Sync = window.FusakiSync || {
    init: function () { return { connected: false, status: 'off' }; },
    getState: function () { return { connected: false, status: 'off' }; },
    create: function () { return Promise.reject(new Error('同期モジュールが読み込まれていません')); },
    join: function () { return Promise.reject(new Error('同期モジュールが読み込まれていません')); },
    leave: function () { return { connected: false, status: 'off' }; },
    test: function () { return Promise.resolve(false); },
    notifyChange: function () {},
    syncNow: function () { return Promise.resolve(false); }
  };

  /** 同期する種別 → state のキー */
  var SYNC_KINDS = {
    schedule: 'schedule',
    check: 'checklist',
    souvenir: 'souvenirs',
    note: 'notes'
  };

  function byIdAsc(a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0); }
  function byIdDesc(a, b) { return byIdAsc(b, a); }

  /** 持ち物はテンプレート順が先、そのあと追加順(uidは時刻順) */
  function checkOrder(a, b) {
    var ma = /^tpl-(\d+)$/.exec(a.id);
    var mb = /^tpl-(\d+)$/.exec(b.id);
    if (ma && mb) return Number(ma[1]) - Number(mb[1]);
    if (ma) return -1;
    if (mb) return 1;
    return byIdAsc(a, b);
  }

  /** ローカル状態を同期ドキュメント形式に変換する */
  function buildLocalDoc() {
    var items = {};

    Object.keys(SYNC_KINDS).forEach(function (kind) {
      var list = state[SYNC_KINDS[kind]] || [];
      list.forEach(function (item) {
        if (!item || !item.id) return;
        var data = {};
        Object.keys(item).forEach(function (k) {
          if (k !== 'id' && k !== 'updatedAt') data[k] = item[k];
        });
        items[kind + ':' + item.id] = {
          kind: kind,
          data: data,
          updatedAt: item.updatedAt || nowISO(),
          deleted: false
        };
      });
    });

    // 削除マーク(生きているレコードより新しいときだけ削除として送る)
    Object.keys(state.tombstones || {}).forEach(function (key) {
      var sep = key.indexOf(':');
      var kind = key.slice(0, sep);
      if (!SYNC_KINDS[kind]) return;
      var ts = state.tombstones[key];
      var alive = items[key];
      if (!alive || new Date(ts).getTime() >= new Date(alive.updatedAt).getTime()) {
        items[key] = { kind: kind, data: {}, updatedAt: ts, deleted: true };
      }
    });

    return {
      v: 1,
      rev: 0,
      updatedAt: nowISO(),
      trip: {
        start: state.trip.start,
        end: state.trip.end,
        updatedAt: state.trip.updatedAt || nowISO()
      },
      items: items
    };
  }

  /** マージ済みドキュメントをローカルへ反映する(常に和集合なのでデータは失われない) */
  function applyDoc(doc) {
    var buckets = { schedule: [], check: [], souvenir: [], note: [] };
    var tombs = {};

    Object.keys(doc.items || {}).forEach(function (key) {
      var rec = doc.items[key];
      if (!rec) return;
      var sep = key.indexOf(':');
      if (sep < 1) return;
      var kind = key.slice(0, sep);
      var id = key.slice(sep + 1);
      if (!SYNC_KINDS[kind] || !id) return;

      if (rec.deleted) {
        tombs[key] = rec.updatedAt;
        return;
      }
      var item = { id: id, updatedAt: rec.updatedAt };
      Object.keys(rec.data || {}).forEach(function (k) {
        if (k !== 'id' && k !== 'updatedAt') item[k] = rec.data[k];
      });
      buckets[kind].push(item);
    });

    buckets.schedule.sort(byIdAsc);
    buckets.check.sort(checkOrder);
    buckets.souvenir.sort(byIdAsc);
    buckets.note.sort(byIdDesc);   // メモは新しい順

    suppressSync = true;
    try {
      if (doc.trip && doc.trip.start) {
        state.trip = {
          start: doc.trip.start,
          end: doc.trip.end || doc.trip.start,
          updatedAt: doc.trip.updatedAt || nowISO()
        };
        save('trip');
      }
      state.schedule = buckets.schedule;
      state.checklist = buckets.check;
      state.souvenirs = buckets.souvenir;
      state.notes = buckets.note;
      state.tombstones = tombs;
      save('schedule');
      save('checklist');
      save('souvenirs');
      save('notes');
      save('tombstones');
    } finally {
      suppressSync = false;
    }

    renderCurrent();
  }

  /** 状態表示だけが変わったときは、カード全体を描き直さず文字だけ差し替える */
  function onSyncStatus(st) {
    if (state.tab !== 'home') return;
    var panel = $('#panel-home');
    if (!panel) return;
    var card = $('#share-card', panel);
    var wasConnected = card ? card.getAttribute('data-connected') === '1' : null;
    var statusEl = $('#share-status', panel);
    if (card && statusEl && wasConnected === !!st.connected && !ui.shareBusy) {
      statusEl.textContent = shareStatusText(st);
      statusEl.className = 'share-status is-' + st.status;
      return;
    }
    renderHome();
  }

  function shareStatusText(st) {
    if (!st.connected) return '';
    if (st.status === 'synced') {
      return st.lastSyncedAt ? '同期済み ' + formatClock(st.lastSyncedAt) : '同期済み';
    }
    if (st.status === 'connecting') return '同期中…';
    return 'オフライン(ローカル保存中)';
  }

  function formatClock(iso) {
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '' : pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function copyShareId(id) {
    var selectFallback = function () {
      var el = $('#share-id-value');
      try {
        if (el && window.getSelection && document.createRange) {
          var range = document.createRange();
          range.selectNodeContents(el);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          toast('選択しました。長押しでコピーしてください');
          return;
        }
      } catch (e) { /* noop */ }
      toast('コピーできませんでした');
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(function () {
          toast('共有IDをコピーしました');
        }, selectFallback);
        return;
      }
    } catch (e) { /* noop */ }
    selectFallback();
  }

  var PRIVACY_NOTE =
    '共有データは無料の公開JSON保管サービスに保存されます。' +
    'IDを知っている人は誰でも閲覧・編集できるため、住所・本名などの個人情報は書かないでください。';

  function renderShareCard() {
    var st = Sync.getState();
    var err = ui.shareError
      ? '<div class="share-error" role="alert">⚠️ ' + esc(ui.shareError) +
          (ui.shareErrorDetail
            ? '<span class="share-error__detail">' + esc(ui.shareErrorDetail) + '</span>'
            : '') +
        '</div>'
      : '';
    var note = '<p class="share-note">🔒 ' + esc(PRIVACY_NOTE) + '</p>';

    if (st.connected) {
      var busyTest = ui.shareBusy === 'test';
      return '' +
        '<section class="section">' +
          '<div class="section__head"><h2 class="section__title">👨‍👩‍👧 家族と共有</h2>' +
            '<div class="section__spacer"></div>' +
            '<span class="share-status is-' + esc(st.status) + '" id="share-status">' + esc(shareStatusText(st)) + '</span>' +
          '</div>' +
          '<div class="card share-card" id="share-card" data-connected="1">' +
            '<p class="share-card__label">共有ID</p>' +
            '<p class="share-id" id="share-id-value">' + esc(st.shareId) + '</p>' +
            '<div class="btn-row">' +
              '<button type="button" class="btn btn--sm btn--primary" data-act="share-copy" data-id="' + esc(st.shareId) + '">📋 コピー</button>' +
              '<button type="button" class="btn btn--sm btn--ghost" data-act="share-test"' + (busyTest ? ' disabled' : '') + '>' +
                (busyTest ? '確認中…' : '🔄 接続テスト') + '</button>' +
            '</div>' +
            '<p class="share-help">このIDをLINEなどでご家族に送ってください。予定・持ち物・メモ・お土産リストが同じ内容で見られます。</p>' +
            err +
            note +
            '<div class="share-leave">' +
              '<div class="row-actions">' +
                '<button type="button" class="btn btn--sm btn--ghost btn--block" data-act="ask-delete">共有を解除</button>' +
              '</div>' +
              '<div class="confirm-box" style="justify-content:space-between">' +
                '<span class="confirm-text">解除しますか?(データは残ります)</span>' +
                '<span style="display:flex;gap:6px">' +
                  '<button type="button" class="btn btn--sm btn--danger" data-act="share-leave">解除</button>' +
                  '<button type="button" class="btn btn--sm btn--ghost" data-act="cancel-delete">やめる</button>' +
                '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</section>';
    }

    var busyCreate = ui.shareBusy === 'create';
    var busyJoin = ui.shareBusy === 'join';
    var joinBlock = ui.shareJoinOpen
      ? '<form class="share-join" data-form="share-join">' +
          '<label class="field__label" for="share-join-id">共有ID</label>' +
          '<div class="inline-add">' +
            '<input class="input" type="text" id="share-join-id" name="shareId" data-keep="share-join-id" ' +
              'placeholder="FB-jb-xxxxxxxx" autocapitalize="off" autocomplete="off" spellcheck="false">' +
            '<button type="submit" class="btn btn--sm btn--primary"' + (busyJoin ? ' disabled' : '') + '>' +
              (busyJoin ? '確認中…' : '参加') + '</button>' +
          '</div>' +
          '<button type="button" class="btn btn--sm btn--ghost" style="margin-top:8px" data-act="share-join-cancel">キャンセル</button>' +
        '</form>'
      : '<button type="button" class="btn btn--ghost btn--block" data-act="share-join-open">共有IDを入力して参加</button>';

    return '' +
      '<section class="section">' +
        '<div class="section__head"><h2 class="section__title">👨‍👩‍👧 家族と共有</h2></div>' +
        '<div class="card share-card" id="share-card" data-connected="0">' +
          '<p class="share-help">予定・持ち物・メモ・お土産リストをご家族の端末と同じ内容にできます。</p>' +
          '<button type="button" class="btn btn--sunset btn--block" style="margin-bottom:8px" data-act="share-create"' +
            (busyCreate ? ' disabled' : '') + '>' + (busyCreate ? '作成中…' : '＋ 共有IDを作成') + '</button>' +
          joinBlock +
          err +
          note +
          renderShareAdvanced() +
        '</div>' +
      '</section>';
  }

  /**
   * 上級者設定(Firebase Realtime Database のURL)。
   * ビルド時定数 DEFAULT_FIREBASE_HOST が入っている場合は設定不要なので出さない。
   */
  function renderShareAdvanced() {
    var cfg = Sync.getConfig ? Sync.getConfig() : null;
    if (!cfg || !cfg.canConfigure) return '';

    var current = cfg.storedHost || '';
    var summary = current
      ? '接続先: ' + current
      : '未設定(既定の公開JSON保管サービスを使用)';

    if (!ui.shareAdvancedOpen) {
      return '' +
        '<button type="button" class="share-advanced__toggle" data-act="share-advanced-open" aria-expanded="false">' +
          '<span>⚙️ 上級者設定</span><span class="share-advanced__chev" aria-hidden="true">▼</span>' +
        '</button>';
    }

    return '' +
      '<div class="share-advanced">' +
        '<button type="button" class="share-advanced__toggle" data-act="share-advanced-close" aria-expanded="true">' +
          '<span>⚙️ 上級者設定</span><span class="share-advanced__chev is-open" aria-hidden="true">▼</span>' +
        '</button>' +
        // ブラウザ既定のバリデーション風船ではなく、アプリ内のエラー表示を使うため type="text"
        '<form data-form="share-host" novalidate>' +
          '<label class="field__label" for="share-host">データベースURL(Firebase Realtime Database)</label>' +
          '<div class="inline-add">' +
            '<input class="input" type="text" id="share-host" name="host" data-keep="share-host" ' +
              'value="' + esc(current) + '" placeholder="https://xxxx-default-rtdb.firebasedatabase.app" ' +
              'autocapitalize="off" autocomplete="off" spellcheck="false" inputmode="url">' +
            '<button type="submit" class="btn btn--sm btn--primary">保存</button>' +
          '</div>' +
        '</form>' +
        '<p class="share-advanced__state">' + esc(summary) + '</p>' +
        (current
          ? '<button type="button" class="btn btn--sm btn--ghost" data-act="share-host-clear">設定を削除</button>'
          : '') +
        '<p class="share-advanced__help">URLを設定すると、共有IDの作成・参加にこのデータベースを使います。' +
          '参加する側はURLの設定は不要です(共有IDにURLが含まれます)。</p>' +
      '</div>';
  }

  /* ======================================================================
   * 5. 描画
   * ==================================================================== */

  var TAB_META = {
    home:      { title: 'ホーム',      sub: 'フサキビーチリゾート' },
    schedule:  { title: 'スケジュール', sub: '旅のタイムライン' },
    resort:    { title: 'リゾート情報', sub: '館内・周辺ガイド' },
    checklist: { title: 'チェックリスト', sub: '持ち物とやること' },
    memo:      { title: 'メモ',        sub: 'メモ・お土産・連絡先' }
  };

  /**
   * パネルを再描画する。
   * data-keep 付きの入力欄の値は描画をまたいで保持する。
   */
  function renderPanel(id, html) {
    var panel = $('#panel-' + id);
    if (!panel) return;
    var kept = {};
    $all('[data-keep]', panel).forEach(function (el) {
      kept[el.getAttribute('data-keep')] = el.value;
    });
    panel.innerHTML = html;
    $all('[data-keep]', panel).forEach(function (el) {
      var k = el.getAttribute('data-keep');
      if (Object.prototype.hasOwnProperty.call(kept, k)) el.value = kept[k];
    });
  }

  function renderCurrent() {
    if (state.tab === 'home') renderHome();
    else if (state.tab === 'schedule') renderSchedule();
    else if (state.tab === 'resort') renderResort();
    else if (state.tab === 'checklist') renderChecklist();
    else if (state.tab === 'memo') renderMemo();
  }

  function switchTab(name) {
    if (!TAB_META[name]) return;
    state.tab = name;

    $all('.tabbar__btn').forEach(function (btn) {
      var active = btn.getAttribute('data-tab') === name;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    $all('.panel').forEach(function (p) {
      p.hidden = p.id !== 'panel-' + name;
    });

    $('#header-title').textContent = TAB_META[name].title;
    $('#header-sub').textContent = TAB_META[name].sub;

    renderCurrent();
    window.scrollTo(0, 0);
  }

  /* --- 5-1. ホーム ------------------------------------------------------ */

  /** 旅行期間に対する今日の位置づけ */
  function tripStatus() {
    var today = todayISO();
    var start = state.trip && state.trip.start;
    var end = state.trip && state.trip.end;
    var fromStart = diffDays(start, today);
    var toStart = diffDays(today, start);
    var fromEnd = diffDays(end, today);

    if (fromStart === null) return { label: '旅行期間を設定しましょう', kind: 'unset' };
    if (toStart > 0) return { label: '出発まであと ' + toStart + '日', kind: 'before' };
    if (fromEnd !== null && fromEnd > 0) return { label: '旅の思い出をふりかえり中', kind: 'after' };

    var total = (fromEnd !== null) ? diffDays(start, end) + 1 : null;
    var nth = fromStart + 1;
    return {
      label: '滞在 ' + nth + '日目' + (total ? ' / 全' + total + '日' : ''),
      kind: 'during'
    };
  }

  function renderTripHero() {
    var today = todayISO();
    var st = tripStatus();
    var trip = state.trip || {};

    if (ui.tripEditing) {
      return '' +
        '<div class="hero">' +
          '<p class="hero__date">旅行期間の設定</p>' +
          '<form class="hero__actions" data-form="trip" style="margin-top:12px">' +
            '<div class="field-row">' +
              '<div class="field">' +
                '<label class="field__label" for="trip-start" style="color:rgba(255,255,255,.85)">開始日</label>' +
                '<input class="input" type="date" id="trip-start" name="start" value="' + esc(trip.start || today) + '" required>' +
              '</div>' +
              '<div class="field">' +
                '<label class="field__label" for="trip-end" style="color:rgba(255,255,255,.85)">終了日</label>' +
                '<input class="input" type="date" id="trip-end" name="end" value="' + esc(trip.end || today) + '" required>' +
              '</div>' +
            '</div>' +
            '<div class="btn-row">' +
              '<button type="submit" class="btn btn--sm btn--sunset">保存する</button>' +
              '<button type="button" class="btn btn--sm btn--ghost" data-act="trip-cancel">キャンセル</button>' +
            '</div>' +
          '</form>' +
        '</div>';
    }

    var range = (trip.start && trip.end)
      ? formatDateShort(trip.start) + ' 〜 ' + formatDateShort(trip.end)
      : '期間が未設定です';

    return '' +
      '<div class="hero">' +
        '<p class="hero__date">' + esc(formatDateLong(today)) + '</p>' +
        '<p class="hero__day">' + esc(st.label) + '</p>' +
        '<p class="hero__range">🗓 ' + esc(range) + '</p>' +
        '<div class="hero__actions">' +
          '<button type="button" class="btn btn--sm btn--ghost" data-act="trip-edit">旅行期間を編集</button>' +
        '</div>' +
      '</div>';
  }

  function renderWeatherCard() {
    var w = state.weather;

    if (w.status === 'loading' || w.status === 'idle') {
      return '' +
        '<div class="card">' +
          '<div class="skeleton skeleton--wide"></div>' +
          '<div class="skeleton"></div>' +
          '<div class="skeleton skeleton--wide"></div>' +
          '<p class="small muted" style="margin-top:12px">天気を読み込んでいます…</p>' +
        '</div>';
    }

    if (w.status === 'error' || !w.data) {
      return '' +
        '<div class="card weather-error">' +
          '<p>☁️ 天気を取得できませんでした<br><span class="small muted">通信環境をご確認ください。天気以外の機能はそのまま使えます。</span></p>' +
          '<button type="button" class="btn btn--sm btn--primary" data-act="weather-retry">再試行する</button>' +
        '</div>';
    }

    var d = w.data;
    var cur = d.current || {};
    var units = d.current_units || {};
    var info = wmoInfo(cur.weather_code);
    var temp = (typeof cur.temperature_2m === 'number') ? Math.round(cur.temperature_2m) : '--';

    var html = '' +
      '<div class="card">' +
        '<div class="weather-now">' +
          '<div class="weather-now__icon" aria-hidden="true">' + info[0] + '</div>' +
          '<div class="weather-now__body">' +
            '<div class="weather-now__temp">' + esc(temp) + '°</div>' +
            '<div class="weather-now__label">' + esc(info[1]) + ' ・ 石垣島(フサキ付近)</div>' +
          '</div>' +
        '</div>' +
        '<div class="weather-meta">' +
          '<span>💨 風 ' + esc(cur.wind_speed_10m != null ? cur.wind_speed_10m : '--') + ' ' + esc(units.wind_speed_10m || 'km/h') + '</span>' +
          '<span>💧 降水 ' + esc(cur.precipitation != null ? cur.precipitation : '--') + ' ' + esc(units.precipitation || 'mm') + '</span>' +
          (cur.time ? '<span>🕘 ' + esc(timeOfISO(cur.time) || '') + ' 現在</span>' : '') +
        '</div>' +
        renderSunStrip(d, cur) +
      '</div>';

    return html + renderForecastCard(d);
  }

  function renderSunStrip(d, cur) {
    var daily = d.daily || {};
    var times = daily.time || [];
    var today = todayISO();
    var idx = times.indexOf(today);
    if (idx < 0) idx = 0;

    var sunrise = daily.sunrise && daily.sunrise[idx];
    var sunset = daily.sunset && daily.sunset[idx];
    if (!sunrise && !sunset) return '';

    var html = '' +
      '<div class="sun-strip">' +
        '<div class="sun-chip"><div class="sun-chip__label">🌅 日の出</div>' +
          '<div class="sun-chip__value">' + esc(timeOfISO(sunrise) || '--:--') + '</div></div>' +
        '<div class="sun-chip"><div class="sun-chip__label">🌇 日の入り</div>' +
          '<div class="sun-chip__value">' + esc(timeOfISO(sunset) || '--:--') + '</div></div>' +
      '</div>';

    // 現地時刻(APIの current.time は Asia/Tokyo)を基準にカウントダウン
    var nowMin = minutesOfISO(cur && cur.time);
    var setMin = minutesOfISO(sunset);
    if (nowMin !== null && setMin !== null && times[idx] === (cur.time || '').slice(0, 10)) {
      var diff = setMin - nowMin;
      if (diff > 0) {
        var h = Math.floor(diff / 60);
        var m = diff % 60;
        var left = h > 0 ? h + '時間' + m + '分' : m + '分';
        html += '<div class="sunset-countdown">🌅 サンセットまであと ' + esc(left) + '</div>';
      } else if (diff > -90) {
        html += '<div class="sunset-countdown">🌙 日が沈みました。トワイライトの時間です</div>';
      }
    }
    return html;
  }

  function renderForecastCard(d) {
    var daily = d.daily || {};
    var times = daily.time || [];
    if (!times.length) return '';
    var today = todayISO();

    var rows = times.map(function (t, i) {
      var info = wmoInfo(daily.weather_code && daily.weather_code[i]);
      var max = daily.temperature_2m_max && daily.temperature_2m_max[i];
      var min = daily.temperature_2m_min && daily.temperature_2m_min[i];
      var pop = daily.precipitation_probability_max && daily.precipitation_probability_max[i];
      var isToday = t === today;
      return '' +
        '<div class="forecast__row' + (isToday ? ' is-today' : '') + '">' +
          '<div class="forecast__day">' + (isToday ? '今日' : esc(formatDateShort(t) + '(' + weekdayOf(t) + ')')) + '</div>' +
          '<div class="forecast__icon" title="' + esc(info[1]) + '">' + info[0] + '</div>' +
          '<div class="forecast__pop">' + (pop != null ? '☔️ ' + esc(pop) + '%' : '') + '</div>' +
          '<div class="forecast__temp">' +
            '<span class="max">' + (max != null ? Math.round(max) : '--') + '°</span>' +
            ' / <span class="min">' + (min != null ? Math.round(min) : '--') + '°</span>' +
          '</div>' +
        '</div>';
    }).join('');

    return '' +
      '<div class="card forecast" style="margin-top:10px">' +
        '<div class="section__title" style="margin-bottom:4px">7日間の予報</div>' +
        rows +
      '</div>';
  }

  function renderTodaySchedule() {
    var today = todayISO();
    var items = state.schedule.filter(function (e) { return e.date === today; });
    items.sort(compareEvents);

    var body;
    if (!items.length) {
      body = '<div class="empty">今日の予定はまだありません。<br>「スケジュール」タブから追加できます。</div>';
    } else {
      body = items.map(function (e) {
        return '' +
          '<div class="item item--sch">' +
            '<div class="item__time' + (e.time ? '' : ' is-empty') + '">' + esc(e.time || '終日') + '</div>' +
            '<div class="item__body">' +
              '<div class="item__title">' + esc(e.title) + '</div>' +
              (e.note ? '<div class="item__note">' + esc(e.note) + '</div>' : '') +
              renderPoiRefChip(e) +
            '</div>' +
            renderPoiRefCard(e) +
          '</div>';
      }).join('');
    }

    return '' +
      '<section class="section">' +
        '<div class="section__head">' +
          '<h2 class="section__title">📅 今日の予定</h2>' +
          '<div class="section__spacer"></div>' +
          '<button type="button" class="btn btn--sm btn--ghost" data-act="goto" data-tab="schedule">すべて見る</button>' +
        '</div>' +
        body +
      '</section>';
  }

  function renderHome() {
    var html =
      renderTripHero() +
      '<section class="section">' +
        '<div class="section__head"><h2 class="section__title">🌤 石垣島の天気</h2></div>' +
        renderWeatherCard() +
      '</section>' +
      renderTodaySchedule() +
      renderShareCard() +
      (storageAvailable ? '' :
        '<div class="data-warning"><strong>⚠️ 保存できない設定です</strong>' +
        'このブラウザでは localStorage が使えないため、入力内容はタブを閉じると失われます。</div>');

    renderPanel('home', html);
  }

  /* --- 5-2. スケジュール ------------------------------------------------ */

  function compareEvents(a, b) {
    var ta = a.time || '99:99';
    var tb = b.time || '99:99';
    if (ta !== tb) return ta < tb ? -1 : 1;
    return (a.title || '') < (b.title || '') ? -1 : 1;
  }

  function renderScheduleForm() {
    if (!ui.scheduleForm) {
      return '<button type="button" class="btn btn--primary btn--block" data-act="sch-new">＋ 予定を追加</button>';
    }
    var f = ui.scheduleForm;
    return '' +
      '<form class="form" data-form="schedule">' +
        '<div class="form__title">' + (f.id ? '✏️ 予定を編集' : '➕ 新しい予定') + '</div>' +
        '<div class="field-row">' +
          '<div class="field">' +
            '<label class="field__label" for="sch-date">日付</label>' +
            '<input class="input" type="date" id="sch-date" name="date" value="' + esc(f.date) + '" required>' +
          '</div>' +
          '<div class="field field--narrow">' +
            '<label class="field__label" for="sch-time">時刻</label>' +
            '<input class="input" type="time" id="sch-time" name="time" value="' + esc(f.time) + '">' +
          '</div>' +
        '</div>' +
        '<div class="field">' +
          '<label class="field__label" for="sch-title">タイトル</label>' +
          '<input class="input" type="text" id="sch-title" name="title" value="' + esc(f.title) + '" placeholder="例: フサキビーチでシュノーケル" required maxlength="80">' +
        '</div>' +
        '<div class="field">' +
          '<label class="field__label" for="sch-note">メモ(任意)</label>' +
          '<textarea class="textarea" id="sch-note" name="note" placeholder="集合場所・予約番号など" maxlength="500">' + esc(f.note) + '</textarea>' +
        '</div>' +
        '<div class="btn-row">' +
          '<button type="submit" class="btn btn--sm btn--primary">' + (f.id ? '更新する' : '追加する') + '</button>' +
          '<button type="button" class="btn btn--sm btn--ghost" data-act="sch-cancel">キャンセル</button>' +
        '</div>' +
      '</form>';
  }

  function renderSchedule() {
    var groups = {};
    state.schedule.forEach(function (e) {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    var dates = Object.keys(groups).sort();
    var today = todayISO();

    var body;
    if (!dates.length) {
      body = '<div class="empty">予定がまだありません。<br>「＋ 予定を追加」から旅程を登録しましょう 🏝</div>';
    } else {
      body = dates.map(function (date) {
        var items = groups[date].slice().sort(compareEvents);
        var dayNo = diffDays(state.trip && state.trip.start, date);
        var badge = '';
        if (date === today) badge = '<span class="day-head__badge">今日</span>';
        else if (dayNo !== null && dayNo >= 0) badge = '<span class="day-head__badge">' + (dayNo + 1) + '日目</span>';

        return '' +
          '<div class="day-group">' +
            '<div class="day-head">' +
              '<span class="day-head__date">' + esc(formatDateShort(date)) + '</span>' +
              '<span class="day-head__wd">(' + esc(weekdayOf(date)) + ')</span>' +
              badge +
            '</div>' +
            items.map(renderScheduleItem).join('') +
          '</div>';
      }).join('');
    }

    renderPanel('schedule', renderScheduleForm() + '<div style="height:14px"></div>' + body);
  }

  function renderScheduleItem(e) {
    return '' +
      '<div class="item item--sch" data-row="' + esc(e.id) + '">' +
        '<div class="item__time' + (e.time ? '' : ' is-empty') + '">' + esc(e.time || '終日') + '</div>' +
        '<div class="item__body">' +
          '<div class="item__title">' + esc(e.title) + '</div>' +
          (e.note ? '<div class="item__note">' + esc(e.note) + '</div>' : '') +
          renderPoiRefChip(e) +
        '</div>' +
        '<div class="item__actions">' +
          '<button type="button" class="btn btn--icon btn--ghost" data-act="sch-edit" data-id="' + esc(e.id) + '" aria-label="編集">✏️</button>' +
          '<button type="button" class="btn btn--icon btn--ghost" data-act="ask-delete" aria-label="削除">🗑</button>' +
        '</div>' +
        '<div class="item__confirm">' +
          '<span class="confirm-text">削除?</span>' +
          '<button type="button" class="btn btn--icon btn--danger" data-act="sch-delete" data-id="' + esc(e.id) + '">削除</button>' +
          '<button type="button" class="btn btn--icon btn--ghost" data-act="cancel-delete">戻す</button>' +
        '</div>' +
        renderPoiRefCard(e) +
      '</div>';
  }

  /* --- 5-3. リゾート情報 ------------------------------------------------ */

  function renderResort() {
    var data = window.RESORT_DATA;

    if (!data || typeof data !== 'object') {
      renderPanel('resort',
        '<div class="data-warning">' +
          '<strong>🏨 リゾート情報を読み込み中 / 未提供です</strong>' +
          'リゾート情報のデータ(<code>data/resort-data.js</code>)がまだ用意されていません。' +
          'データが追加されると、レストラン・ビーチ・アクティビティ・周辺スポットなどがここに表示されます。' +
        '</div>' +
        '<div class="empty" style="margin-top:12px">他のタブ(スケジュール・チェックリスト・メモ)は<br>そのままご利用いただけます。</div>');
      return;
    }

    var html = renderHotelCard(data.hotel) + renderMapSection();

    var categories = Array.isArray(data.categories) ? data.categories : [];
    if (!categories.length) {
      html += '<div class="empty">カテゴリ情報がまだありません。</div>';
    } else {
      html += categories.map(function (cat, i) {
        var id = cat.id || ('cat' + i);
        var items = Array.isArray(cat.items) ? cat.items : [];
        var open = !!ui.openCategories[id];
        return '' +
          '<section class="accordion' + (open ? ' is-open' : '') + '">' +
            '<button type="button" class="accordion__head" data-act="toggle-cat" data-id="' + esc(id) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
              '<span class="accordion__icon" aria-hidden="true">' + esc(cat.icon || '📍') + '</span>' +
              '<span class="accordion__title">' + esc(cat.title || 'その他') + '</span>' +
              '<span class="accordion__count">' + items.length + '</span>' +
              '<span class="accordion__chev" aria-hidden="true">▼</span>' +
            '</button>' +
            '<div class="accordion__body">' +
              (items.length
                ? items.map(function (poiItem) { return renderPoi(poiItem, id, 'resort'); }).join('')
                : '<p class="small muted" style="padding-top:12px">情報がありません。</p>') +
            '</div>' +
          '</section>';
      }).join('');
    }

    if (data.updatedAt) {
      html += '<p class="small muted" style="text-align:center;margin-top:16px">データ更新日: ' + esc(data.updatedAt) + '</p>';
    }

    renderPanel('resort', html);
    applyMapView();
  }

  function renderHotelCard(hotel) {
    if (!hotel || typeof hotel !== 'object') return '';
    var rows = '';
    if (hotel.address) rows += '<dt>住所</dt><dd>' + esc(hotel.address) + '</dd>';
    if (hotel.checkIn || hotel.checkOut) {
      rows += '<dt>IN / OUT</dt><dd>' + esc(hotel.checkIn || '—') + ' / ' + esc(hotel.checkOut || '—') + '</dd>';
    }
    if (hotel.tel) rows += '<dt>電話</dt><dd>' + esc(hotel.tel) + '</dd>';

    var notes = Array.isArray(hotel.notes) && hotel.notes.length
      ? '<ul class="notes-list">' + hotel.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>'
      : '';

    return '' +
      '<div class="hotel-card">' +
        '<div class="hotel-card__name">🏨 ' + esc(hotel.name || 'ホテル') + '</div>' +
        (rows ? '<dl class="kv">' + rows + '</dl>' : '') +
        notes +
        renderLinkChips(hotel) +
      '</div>';
  }

  /** 電話・公式サイト・地図のchip(配列で返す) */
  function linkChips(obj) {
    var chips = [];
    var tel = telHref(obj.tel);
    if (tel) chips.push('<a class="chip" href="' + esc(tel) + '">📞 電話する</a>');
    var url = safeUrl(obj.url);
    if (url) chips.push('<a class="chip" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">🔗 公式サイト</a>');
    var map = safeUrl(obj.mapUrl);
    if (map) chips.push('<a class="chip" href="' + esc(map) + '" target="_blank" rel="noopener noreferrer">🗺 地図</a>');
    return chips;
  }

  function renderLinkChips(obj) {
    var chips = linkChips(obj);
    return chips.length ? '<div class="chip-row">' + chips.join('') + '</div>' : '';
  }

  var KIDS_BADGE = {
    ok:      { cls: 'ok',      label: '👧 5歳OK' },
    partial: { cls: 'partial', label: '👧 条件付き' },
    no:      { cls: 'no',      label: '👧 5歳は不可' },
    unknown: { cls: 'unknown', label: '👧 要確認' }
  };

  /**
   * 施設カードを描く。
   * @param item   施設データ
   * @param catId  カテゴリid(予定への参照に使う)
   * @param mode   'resort' … リゾート情報タブ(「予定に追加」ボタンあり)
   *               'ref'    … 予定から参照して展開したとき(ボタンなし)
   */
  function renderPoi(item, catId, mode, opts) {
    if (!item || typeof item !== 'object') return '';
    opts = opts || {};
    var origin = opts.origin || 'list';        // 'list'(アコーディオン) | 'map'(館内マップ)
    var idPrefix = opts.idPrefix || 'poi';     // 同じ施設が2箇所に出てもidが衝突しないように
    var meta = '';
    if (item.hours) meta += '<span>🕒 ' + esc(item.hours) + '</span>';
    if (item.location) meta += '<span>📍 ' + esc(item.location) + '</span>';
    var kb = KIDS_BADGE[item.kids] || null;

    var chips = linkChips(item);
    var formOpen = false;
    if (mode !== 'ref') {
      formOpen = !!(ui.poiForm && ui.poiForm.cat === catId &&
                    ui.poiForm.name === item.name && ui.poiForm.from === origin);
      if (!formOpen) {
        chips.unshift(
          '<button type="button" class="chip chip--btn chip--add" data-act="poi-add-open" ' +
            'data-cat="' + esc(catId || '') + '" data-name="' + esc(item.name || '') + '" ' +
            'data-from="' + esc(origin) + '">📅 予定に追加</button>'
        );
      }
    }

    return '' +
      '<article class="poi">' +
        '<h3 class="poi__name">' + esc(item.name || '') +
          (kb ? ' <span class="kids-badge kids-badge--' + kb.cls + '">' + kb.label + '</span>' : '') +
        '</h3>' +
        (item.description ? '<p class="poi__desc">' + esc(item.description) + '</p>' : '') +
        (meta ? '<div class="poi__meta">' + meta + '</div>' : '') +
        (item.tips ? '<p class="poi__tips">💡 ' + esc(item.tips) + '</p>' : '') +
        (item.kidsNote ? '<p class="poi__kids">👧 ' + esc(item.kidsNote) + '</p>' : '') +
        (chips.length ? '<div class="chip-row">' + chips.join('') + '</div>' : '') +
        (formOpen ? renderPoiAddForm(item, catId, idPrefix) : '') +
      '</article>';
  }

  /** 施設カード内に開く「予定に追加」フォーム */
  function renderPoiAddForm(item, catId, idPrefix) {
    idPrefix = idPrefix || 'poi';
    var dateId = idPrefix + '-date';
    var timeId = idPrefix + '-time';
    var noteId = idPrefix + '-note';
    var trip = state.trip || {};
    var range = '';
    if (trip.start) range += ' min="' + esc(trip.start) + '"';
    if (trip.end) range += ' max="' + esc(trip.end) + '"';

    // min/max は日付ピッカーのヒント。旅行期間外も選べるよう novalidate にして、
    // ブラウザ既定の検証バルーンではなくアプリ側で処理する。
    return '' +
      '<form class="form poi-form" data-form="poi-add" novalidate ' +
          'data-cat="' + esc(catId || '') + '" data-name="' + esc(item.name || '') + '">' +
        '<div class="form__title">📅 「' + esc(item.name || '') + '」を予定に追加</div>' +
        '<div class="field-row">' +
          '<div class="field">' +
            '<label class="field__label" for="' + dateId + '">日付</label>' +
            '<input class="input" type="date" id="' + dateId + '" name="date" value="' + esc(defaultPoiDate()) + '"' + range + '>' +
          '</div>' +
          '<div class="field field--narrow">' +
            '<label class="field__label" for="' + timeId + '">時刻(任意)</label>' +
            '<input class="input" type="time" id="' + timeId + '" name="time">' +
          '</div>' +
        '</div>' +
        '<div class="field">' +
          '<label class="field__label" for="' + noteId + '">メモ(任意)</label>' +
          '<textarea class="textarea textarea--sm" id="' + noteId + '" name="note" placeholder="予約番号・待ち合わせ場所など" maxlength="500"></textarea>' +
        '</div>' +
        '<div class="btn-row">' +
          '<button type="submit" class="btn btn--sm btn--primary">追加する</button>' +
          '<button type="button" class="btn btn--sm btn--ghost" data-act="poi-add-cancel">キャンセル</button>' +
        '</div>' +
        (item.hours ? '<p class="poi-form__hours">🕒 営業時間: ' + esc(item.hours) + '</p>' : '') +
      '</form>';
  }

  /** 追加フォームの初期日付: 旅行期間内に収まるように寄せる */
  function defaultPoiDate() {
    var today = todayISO();
    var trip = state.trip || {};
    if (!trip.start) return today;
    if (diffDays(today, trip.start) > 0) return trip.start;      // 出発前 → 初日
    if (trip.end && diffDays(trip.end, today) > 0) return trip.end; // 終了後 → 最終日
    return today;
  }

  /**
   * 予定の poi 参照から施設データを探す(カテゴリid + 施設名)。
   * RESORT_DATA が未読み込み / 名前が変わった場合は null を返す(例外は出さない)。
   */
  function findPoi(poi) {
    try {
      if (!poi || !poi.name) return null;
      var data = window.RESORT_DATA;
      if (!data || !Array.isArray(data.categories)) return null;
      for (var i = 0; i < data.categories.length; i++) {
        var cat = data.categories[i];
        if (!cat || cat.id !== poi.cat) continue;
        var items = Array.isArray(cat.items) ? cat.items : [];
        for (var j = 0; j < items.length; j++) {
          if (items[j] && items[j].name === poi.name) return { item: items[j], catId: cat.id };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /** 予定に付ける「🏨 施設情報」chip(参照できないときは空文字) */
  function renderPoiRefChip(e) {
    if (!findPoi(e.poi)) return '';
    var open = !!ui.openPoi[e.id];
    return '' +
      '<div class="chip-row">' +
        '<button type="button" class="chip chip--btn" data-act="poi-toggle" data-id="' + esc(e.id) + '" ' +
          'aria-expanded="' + (open ? 'true' : 'false') + '">🏨 施設情報</button>' +
      '</div>';
  }

  /** 展開された施設カード(閉じているとき・参照できないときは空文字) */
  function renderPoiRefCard(e) {
    if (!ui.openPoi[e.id]) return '';
    var found = findPoi(e.poi);
    if (!found) return '';
    return '<div class="poi-ref">' + renderPoi(found.item, found.catId, 'ref') + '</div>';
  }


  /* --- 5-3b. 館内マップ(インタラクティブSVG) ---------------------------- */

  var MAP_VIEWBOX = { w: 1000, h: 700 };
  var MAP_MIN_SCALE = 1;
  var MAP_MAX_SCALE = 4;
  var MAP_ZOOM_STEP = 1.5;

  /** 面の種類(未知の kind は green として描く) */
  var MAP_KINDS = {
    sea: 1, beach: 1, green: 1, building: 1, pool: 1, road: 1, path: 1
  };

  /** 現在の拡大・移動量。再描画をまたいで保持する */
  var mapView = { scale: 1, tx: 0, ty: 0 };
  var mapGesture = {
    dragging: false, moved: false,
    startX: 0, startY: 0, baseTx: 0, baseTy: 0,
    pinchDist: 0, baseScale: 1, lastTap: 0
  };

  /** window.RESORT_MAP が使える形なら返す。そうでなければ null */
  function mapData() {
    try {
      var m = window.RESORT_MAP;
      if (!m || typeof m !== 'object') return null;
      if (!Array.isArray(m.areas) && !Array.isArray(m.pins)) return null;
      return m;
    } catch (e) {
      return null;
    }
  }

  /** 数値として妥当なものだけ通す(不正なデータでSVGが壊れないように) */
  function num(value, fallback) {
    var n = Number(value);
    return isFinite(n) ? n : (fallback || 0);
  }

  /** SVG の points 属性に使える文字だけ残す */
  function safePoints(value) {
    if (!value) return '';
    return String(value).replace(/[^0-9eE.,\-+\s]/g, '').trim();
  }

  function renderMapSection() {
    var m = mapData();
    if (!m) return '';   // データが無ければセクションごと出さない

    var areas = Array.isArray(m.areas) ? m.areas : [];
    var pins = Array.isArray(m.pins) ? m.pins : [];
    var official = safeUrl(m.officialMapUrl);
    var crowded = crowdedLabels(pins, areas);

    var svg = '' +
      '<svg class="map-svg" viewBox="0 0 ' + MAP_VIEWBOX.w + ' ' + MAP_VIEWBOX.h + '" ' +
          'preserveAspectRatio="xMidYMid meet" role="img" aria-label="館内マップ">' +
        '<defs>' +
          '<linearGradient id="map-sea-grad" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" class="map-sea-stop1"/>' +
            '<stop offset="100%" class="map-sea-stop2"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<rect class="map-bg" x="0" y="0" width="' + MAP_VIEWBOX.w + '" height="' + MAP_VIEWBOX.h + '"/>' +
        areas.map(renderMapArea).join('') +
        pins.map(function (pin, i) { return renderMapPin(pin, i, crowded[i]); }).join('') +
      '</svg>';

    return '' +
      '<section class="section map-section">' +
        '<div class="section__head">' +
          '<h2 class="section__title">🗺 館内マップ</h2>' +
          '<div class="section__spacer"></div>' +
          '<div class="map-zoom">' +
            '<button type="button" class="btn btn--icon btn--ghost" data-act="map-zoom" data-dir="out" aria-label="縮小">−</button>' +
            '<button type="button" class="btn btn--icon btn--ghost" data-act="map-zoom" data-dir="in" aria-label="拡大">＋</button>' +
            '<button type="button" class="btn btn--icon btn--ghost" id="map-reset" data-act="map-zoom" data-dir="reset" aria-label="表示をリセット">⟲</button>' +
          '</div>' +
        '</div>' +
        '<div class="map-card">' +
          '<div class="map-viewport" id="map-viewport">' +
            '<div class="map-stage" id="map-stage" style="transform:' + mapTransform() + '">' + svg + '</div>' +
          '</div>' +
        '</div>' +
        renderMapDetail(m) +
        '<p class="map-hint">ピンをタップすると詳細が出ます。' +
          '2本指で拡大・1本指で移動、ダブルタップで元に戻ります。</p>' +
        (official
          ? '<div class="chip-row"><a class="chip" href="' + esc(official) + '" target="_blank" rel="noopener noreferrer">🔗 公式マップを開く</a></div>'
          : '') +
      '</section>';
  }

  /** 背景の面。road / path は薄い線(polyline)として描く */
  function renderMapArea(a) {
    if (!a || typeof a !== 'object') return '';
    var kind = String(a.kind || 'green');
    if (!MAP_KINDS[kind]) kind = 'green';
    var cls = 'map-area map-area--' + kind;
    var isLine = (kind === 'road' || kind === 'path');
    var pts = safePoints(a.points);
    var shape = '';

    if (isLine && pts) {
      shape = '<polyline class="' + cls + '" points="' + esc(pts) + '"/>';
    } else if (pts) {
      shape = '<polygon class="' + cls + '" points="' + esc(pts) + '"/>';
    } else if (a.rect && typeof a.rect === 'object') {
      var r = a.rect;
      shape = '<rect class="' + cls + '" x="' + num(r.x) + '" y="' + num(r.y) +
        '" width="' + num(r.w) + '" height="' + num(r.h) + '" rx="' + num(r.r, 6) + '"/>';
    }
    if (!shape) return '';

    var label = '';
    if (a.label && a.labelPos) {
      label = '<text class="map-area__label" x="' + num(a.labelPos.x) + '" y="' + num(a.labelPos.y) +
        '">' + esc(a.label) + '</text>';
    }
    return shape + label;
  }

  var MAP_LABEL_FONT = 25;   // styles.css の .map-pin__label と揃える
  var MAP_AREA_FONT = 28;    // styles.css の .map-area__label と揃える

  /** ラベルのおおよその半幅(座標単位)。全角は1em、半角は約0.58emで見積もる */
  function labelHalfWidth(text, fontSize) {
    var w = 0;
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      var wide = (c >= 0x3000 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
      w += wide ? 1 : 0.58;
    }
    return w * fontSize / 2;
  }

  /**
   * 重なって読めなくなるピン名を間引く。
   * 面ラベル(ノースウイング等)を先に置き、そこへ重なるピン名は隠す。
   * 隠れたピンも、タップして選択すれば名前が出る。
   */
  function crowdedLabels(pins, areas) {
    var placed = [];
    var hidden = {};

    areas.forEach(function (a) {
      if (!a || !a.label || !a.labelPos) return;
      placed.push({
        x: num(a.labelPos.x),
        y: num(a.labelPos.y),
        half: labelHalfWidth(String(a.label), MAP_AREA_FONT)
      });
    });

    pins.forEach(function (pin, i) {
      var text = pin ? String(pin.short || pin.name || '') : '';
      if (!text) { hidden[i] = true; return; }
      var half = labelHalfWidth(text, MAP_LABEL_FONT);
      var x = num(pin.x);
      var y = num(pin.y) + 52;
      var clash = placed.some(function (p) {
        return Math.abs(p.y - y) < 30 && Math.abs(p.x - x) < (p.half + half + 6);
      });
      if (clash) hidden[i] = true;
      else placed.push({ x: x, y: y, half: half });
    });
    return hidden;
  }

  function renderMapPin(pin, index, crowded) {
    if (!pin || typeof pin !== 'object') return '';
    var selected = ui.mapPin === index;
    var label = pin.short || pin.name || '';
    return '' +
      '<g class="map-pin' + (selected ? ' is-selected' : '') +
          (crowded ? ' is-crowded' : '') + '" data-act="map-pin" data-idx="' + index + '" ' +
          'transform="translate(' + num(pin.x) + ',' + num(pin.y) + ')" ' +
          'role="button" tabindex="0" aria-pressed="' + (selected ? 'true' : 'false') + '" ' +
          'aria-label="' + esc(pin.name || label) + '">' +
        // viewBox(1000x700)を幅360px前後で表示するため、ピンは大きめの座標値で描く
        '<circle class="map-pin__hit" r="34"/>' +
        '<circle class="map-pin__halo" r="30"/>' +
        '<circle class="map-pin__dot" r="22"/>' +
        '<text class="map-pin__icon" y="9">' + esc(pin.icon || '📍') + '</text>' +
        '<text class="map-pin__label" y="52">' + esc(label) + '</text>' +
      '</g>';
  }

  /** 選択中のピンの詳細。resort-data に対応があれば施設カードを再利用する */
  function renderMapDetail(m) {
    var index = ui.mapPin;
    if (index === null || index === undefined) return '';
    var pins = Array.isArray(m.pins) ? m.pins : [];
    var pin = pins[index];
    if (!pin) return '';

    var found = pin.cat ? findPoi({ cat: pin.cat, name: pin.name }) : null;
    var inner;
    if (found) {
      // 「予定に追加」も使えるように list と同じモードで描く(idは分ける)
      inner = renderPoi(found.item, found.catId, 'resort', { origin: 'map', idPrefix: 'mappoi' });
    } else {
      inner = '' +
        '<article class="poi">' +
          '<h3 class="poi__name">' + esc(pin.icon || '📍') + ' ' + esc(pin.name || '') + '</h3>' +
          (pin.cat
            ? '<p class="poi__desc muted">この施設の詳細情報は準備中です。</p>'
            : '<p class="poi__desc muted">館内の目印です。</p>') +
        '</article>';
    }

    return '' +
      '<div class="map-detail" id="map-detail">' +
        '<button type="button" class="map-detail__close" data-act="map-close" aria-label="閉じる">✕</button>' +
        inner +
      '</div>';
  }

  /* --- マップの拡大・移動 ---------------------------------------------- */

  function mapTransform() {
    return 'translate(' + mapView.tx.toFixed(1) + 'px,' + mapView.ty.toFixed(1) + 'px) scale(' + mapView.scale.toFixed(3) + ')';
  }

  /** 拡大しても地図が枠から離れすぎないように移動量を制限する */
  function clampMapView() {
    var vp = $('#map-viewport');
    if (!vp) return;
    var maxX = vp.clientWidth * (mapView.scale - 1) / 2;
    var maxY = vp.clientHeight * (mapView.scale - 1) / 2;
    mapView.tx = Math.max(-maxX, Math.min(maxX, mapView.tx));
    mapView.ty = Math.max(-maxY, Math.min(maxY, mapView.ty));
  }

  function applyMapView() {
    clampMapView();
    var stage = $('#map-stage');
    if (stage) stage.style.transform = mapTransform();
    var reset = $('#map-reset');
    if (reset) reset.disabled = (mapView.scale === 1 && mapView.tx === 0 && mapView.ty === 0);
  }

  function setMapScale(next, recenter) {
    mapView.scale = Math.max(MAP_MIN_SCALE, Math.min(MAP_MAX_SCALE, next));
    if (recenter || mapView.scale === MAP_MIN_SCALE) {
      mapView.tx = 0;
      mapView.ty = 0;
    }
    applyMapView();
  }

  /** 拡大中に選んだピンが画面外に行かないよう中央へ寄せる */
  function centerMapOn(pin) {
    var vp = $('#map-viewport');
    if (!vp || !pin || mapView.scale <= MAP_MIN_SCALE) { applyMapView(); return; }
    var w = vp.clientWidth;
    var h = vp.clientHeight;
    var px = num(pin.x) / MAP_VIEWBOX.w * w;
    var py = num(pin.y) / MAP_VIEWBOX.h * h;
    mapView.tx = -(px - w / 2) * mapView.scale;
    mapView.ty = -(py - h / 2) * mapView.scale;
    applyMapView();
  }

  function resetMapView() {
    mapView.scale = 1;
    mapView.tx = 0;
    mapView.ty = 0;
    applyMapView();
  }

  function touchDistance(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function startMapDrag(x, y) {
    mapGesture.dragging = true;
    mapGesture.moved = false;
    mapGesture.startX = x;
    mapGesture.startY = y;
    mapGesture.baseTx = mapView.tx;
    mapGesture.baseTy = mapView.ty;
  }

  function moveMapDrag(x, y) {
    if (!mapGesture.dragging) return;
    var dx = x - mapGesture.startX;
    var dy = y - mapGesture.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) mapGesture.moved = true;
    if (mapView.scale <= MAP_MIN_SCALE) return;   // 等倍のときは動かさない
    mapView.tx = mapGesture.baseTx + dx;
    mapView.ty = mapGesture.baseTy + dy;
    applyMapView();
  }

  function inMapViewport(target) {
    return !!(target && target.closest && target.closest('.map-viewport'));
  }

  /**
   * タッチ/マウスのジェスチャー。
   * .map-viewport には touch-action:none を当ててあるので preventDefault は不要
   * (パッシブリスナーのままブラウザのスクロールと競合しない)。
   */
  function bindMapGestures() {
    document.addEventListener('touchstart', function (ev) {
      if (!inMapViewport(ev.target)) return;
      if (ev.touches.length === 2) {
        mapGesture.dragging = false;
        mapGesture.pinchDist = touchDistance(ev.touches);
        mapGesture.baseScale = mapView.scale;
      } else if (ev.touches.length === 1) {
        startMapDrag(ev.touches[0].clientX, ev.touches[0].clientY);
        var now = Date.now();
        if (now - mapGesture.lastTap < 320) {   // ダブルタップでリセット
          resetMapView();
          mapGesture.moved = true;              // 直後のピン選択は抑制する
          mapGesture.lastTap = 0;
        } else {
          mapGesture.lastTap = now;
        }
      }
    }, { passive: true });

    document.addEventListener('touchmove', function (ev) {
      if (!$('#map-stage')) return;
      if (ev.touches.length === 2 && mapGesture.pinchDist > 0) {
        setMapScale(mapGesture.baseScale * (touchDistance(ev.touches) / mapGesture.pinchDist));
        mapGesture.moved = true;
      } else if (ev.touches.length === 1) {
        moveMapDrag(ev.touches[0].clientX, ev.touches[0].clientY);
      }
    }, { passive: true });

    document.addEventListener('touchend', function () {
      mapGesture.dragging = false;
      mapGesture.pinchDist = 0;
    });

    document.addEventListener('mousedown', function (ev) {
      if (!inMapViewport(ev.target)) return;
      startMapDrag(ev.clientX, ev.clientY);
    });
    document.addEventListener('mousemove', function (ev) {
      if (mapGesture.dragging) moveMapDrag(ev.clientX, ev.clientY);
    });
    document.addEventListener('mouseup', function () {
      mapGesture.dragging = false;
    });
  }

  /* --- 5-4. チェックリスト ---------------------------------------------- */

  function renderChecklist() {
    var pack = state.checklist.filter(function (i) { return i.sec !== 'todo'; });
    var todo = state.checklist.filter(function (i) { return i.sec === 'todo'; });
    var doneCount = state.checklist.filter(function (i) { return i.done; }).length;
    var total = state.checklist.length;
    var pct = total ? Math.round((doneCount / total) * 100) : 0;

    var html = '' +
      '<div class="progress">' +
        '<div class="progress__bar"><div class="progress__fill" style="width:' + pct + '%"></div></div>' +
        '<div class="progress__text">' + doneCount + ' / ' + total + '</div>' +
      '</div>' +
      renderCheckSection('🧳 持ち物', 'pack', pack) +
      renderCheckSection('📌 やること', 'todo', todo) +
      '<div class="card card--flat" style="margin-top:20px">' +
        '<div class="row-actions">' +
          '<p class="small muted" style="margin-bottom:10px">チェック状態と追加した項目をすべて消して、初期テンプレートに戻します。</p>' +
          '<button type="button" class="btn btn--sm btn--ghost btn--block" data-act="ask-delete">↩️ テンプレートにリセット</button>' +
        '</div>' +
        '<div class="confirm-box" style="justify-content:space-between">' +
          '<span class="confirm-text">本当にリセットしますか?</span>' +
          '<span style="display:flex;gap:6px">' +
            '<button type="button" class="btn btn--sm btn--danger" data-act="checklist-reset">リセット</button>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-act="cancel-delete">やめる</button>' +
          '</span>' +
        '</div>' +
      '</div>';

    renderPanel('checklist', html);
  }

  function renderCheckSection(title, sec, items) {
    var list = items.length
      ? items.map(renderCheckItem).join('')
      : '<div class="empty">項目がありません。下から追加できます。</div>';

    return '' +
      '<section class="section">' +
        '<div class="section__head"><h2 class="section__title">' + title + '</h2>' +
          '<div class="section__spacer"></div>' +
          '<span class="small muted">' + items.filter(function (i) { return i.done; }).length + '/' + items.length + '</span>' +
        '</div>' +
        list +
        '<form class="inline-add" data-form="check-add" data-sec="' + esc(sec) + '" style="margin-top:10px">' +
          '<input class="input" type="text" name="text" data-keep="add-' + esc(sec) + '" placeholder="項目を追加" maxlength="60" aria-label="項目を追加">' +
          '<button type="submit" class="btn btn--sm btn--primary">追加</button>' +
        '</form>' +
      '</section>';
  }

  function renderCheckItem(item) {
    return '' +
      '<div class="check' + (item.done ? ' is-done' : '') + '" data-row="' + esc(item.id) + '">' +
        '<button type="button" class="check__toggle" data-act="check-toggle" data-id="' + esc(item.id) + '" aria-pressed="' + (item.done ? 'true' : 'false') + '">' +
          '<span class="check__box" aria-hidden="true">✓</span>' +
          '<span class="check__label">' + esc(item.text) + '</span>' +
        '</button>' +
        '<div class="item__actions">' +
          '<button type="button" class="btn btn--icon btn--ghost" data-act="ask-delete" aria-label="削除">🗑</button>' +
        '</div>' +
        '<div class="item__confirm">' +
          '<button type="button" class="btn btn--icon btn--danger" data-act="check-delete" data-id="' + esc(item.id) + '">削除</button>' +
          '<button type="button" class="btn btn--icon btn--ghost" data-act="cancel-delete">戻す</button>' +
        '</div>' +
      '</div>';
  }

  /* --- 5-5. メモ -------------------------------------------------------- */

  function renderMemo() {
    renderPanel('memo',
      renderNotesSection() +
      renderSouvenirSection() +
      renderLinksSection());
  }

  function renderNotesSection() {
    var form;
    if (ui.noteForm) {
      var f = ui.noteForm;
      form = '' +
        '<form class="form" data-form="note">' +
          '<div class="form__title">' + (f.id ? '✏️ メモを編集' : '➕ 新しいメモ') + '</div>' +
          '<div class="field">' +
            '<label class="field__label" for="note-title">タイトル</label>' +
            '<input class="input" type="text" id="note-title" name="title" value="' + esc(f.title) + '" placeholder="例: 島のおすすめごはん" required maxlength="80">' +
          '</div>' +
          '<div class="field">' +
            '<label class="field__label" for="note-body">本文</label>' +
            '<textarea class="textarea" id="note-body" name="body" placeholder="自由に書き留めましょう" maxlength="4000">' + esc(f.body) + '</textarea>' +
          '</div>' +
          '<div class="btn-row">' +
            '<button type="submit" class="btn btn--sm btn--primary">' + (f.id ? '更新する' : '保存する') + '</button>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-act="note-cancel">キャンセル</button>' +
          '</div>' +
        '</form>';
    } else {
      form = '<button type="button" class="btn btn--primary btn--block" data-act="note-new">＋ メモを追加</button>';
    }

    var list = state.notes.length
      ? state.notes.map(function (n) {
          return '' +
            '<div class="card note-card" data-row="' + esc(n.id) + '">' +
              '<div class="note-card__head">' +
                '<div class="note-card__title">' + esc(n.title) + '</div>' +
                '<div class="item__actions">' +
                  '<button type="button" class="btn btn--icon btn--ghost" data-act="note-edit" data-id="' + esc(n.id) + '" aria-label="編集">✏️</button>' +
                  '<button type="button" class="btn btn--icon btn--ghost" data-act="ask-delete" aria-label="削除">🗑</button>' +
                '</div>' +
                '<div class="item__confirm">' +
                  '<button type="button" class="btn btn--icon btn--danger" data-act="note-delete" data-id="' + esc(n.id) + '">削除</button>' +
                  '<button type="button" class="btn btn--icon btn--ghost" data-act="cancel-delete">戻す</button>' +
                '</div>' +
              '</div>' +
              (n.body ? '<div class="note-card__body">' + esc(n.body) + '</div>' : '') +
              (n.updatedAt ? '<div class="note-card__time">更新 ' + esc(formatUpdatedAt(n.updatedAt)) + '</div>' : '') +
            '</div>';
        }).join('')
      : '<div class="empty">メモはまだありません。<br>気づいたことを気軽に残しましょう ✍️</div>';

    return '' +
      '<section class="section">' +
        '<div class="section__head"><h2 class="section__title">📝 フリーメモ</h2></div>' +
        form +
        '<div style="height:12px"></div>' +
        list +
      '</section>';
  }

  function renderSouvenirSection() {
    var form = ui.souvenirFormOpen
      ? '' +
        '<form class="form" data-form="souvenir">' +
          '<div class="form__title">🎁 お土産を追加</div>' +
          '<div class="field">' +
            '<label class="field__label" for="sv-who">誰に</label>' +
            '<input class="input" type="text" id="sv-who" name="who" placeholder="例: 会社のみんな" maxlength="40" required>' +
          '</div>' +
          '<div class="field">' +
            '<label class="field__label" for="sv-what">何を</label>' +
            '<input class="input" type="text" id="sv-what" name="what" placeholder="例: ちんすこう・紅芋タルト" maxlength="80" required>' +
          '</div>' +
          '<div class="btn-row">' +
            '<button type="submit" class="btn btn--sm btn--primary">追加する</button>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-act="sv-cancel">キャンセル</button>' +
          '</div>' +
        '</form>'
      : '<button type="button" class="btn btn--sunset btn--block" data-act="sv-new">＋ お土産を追加</button>';

    var list = state.souvenirs.length
      ? state.souvenirs.map(function (s) {
          return '' +
            '<div class="item souvenir' + (s.done ? ' is-done' : '') + '" data-row="' + esc(s.id) + '">' +
              '<button type="button" class="check__toggle" style="flex:1" data-act="sv-toggle" data-id="' + esc(s.id) + '" aria-pressed="' + (s.done ? 'true' : 'false') + '">' +
                '<span class="check__box" aria-hidden="true">✓</span>' +
                '<span class="item__body">' +
                  '<span class="souvenir__who">' + esc(s.who) + '</span>' +
                  '<span class="item__title" style="display:block">' + esc(s.what) + '</span>' +
                '</span>' +
              '</button>' +
              '<div class="item__actions">' +
                '<button type="button" class="btn btn--icon btn--ghost" data-act="ask-delete" aria-label="削除">🗑</button>' +
              '</div>' +
              '<div class="item__confirm">' +
                '<button type="button" class="btn btn--icon btn--danger" data-act="sv-delete" data-id="' + esc(s.id) + '">削除</button>' +
                '<button type="button" class="btn btn--icon btn--ghost" data-act="cancel-delete">戻す</button>' +
              '</div>' +
            '</div>';
        }).join('')
      : '<div class="empty">お土産リストは空です。<br>買うものを先にメモしておくと安心 🎁</div>';

    var bought = state.souvenirs.filter(function (s) { return s.done; }).length;

    return '' +
      '<section class="section">' +
        '<div class="section__head"><h2 class="section__title">🎁 お土産リスト</h2>' +
          '<div class="section__spacer"></div>' +
          '<span class="small muted">' + bought + '/' + state.souvenirs.length + ' 購入済み</span>' +
        '</div>' +
        form +
        '<div style="height:12px"></div>' +
        list +
      '</section>';
  }

  function renderLinksSection() {
    var data = window.RESORT_DATA;
    var links = (data && Array.isArray(data.links)) ? data.links : [];
    var emergency = (data && Array.isArray(data.emergency)) ? data.emergency : [];

    if (!links.length && !emergency.length) {
      return '' +
        '<section class="section">' +
          '<div class="section__head"><h2 class="section__title">☎️ 便利リンク・緊急連絡</h2></div>' +
          '<div class="data-warning">リンク・緊急連絡先のデータ(<code>data/resort-data.js</code>)は読み込み中 / 未提供です。</div>' +
        '</section>';
    }

    function entry(e, isEmergency) {
      var tel = telHref(e.tel);
      var url = safeUrl(e.url);
      var chips = [];
      if (tel) chips.push('<a class="chip" href="' + esc(tel) + '">📞 ' + esc(e.tel) + '</a>');
      if (url) chips.push('<a class="chip" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">🔗 開く</a>');
      return '' +
        '<div class="item">' +
          '<div class="item__body">' +
            '<div class="item__title">' + (isEmergency ? '🚑 ' : '🔖 ') + esc(e.label || '') + '</div>' +
            (e.note ? '<div class="item__note">' + esc(e.note) + '</div>' : '') +
            (chips.length ? '<div class="chip-row">' + chips.join('') + '</div>' : '') +
          '</div>' +
        '</div>';
    }

    var html = '<section class="section"><div class="section__head"><h2 class="section__title">☎️ 便利リンク・緊急連絡</h2></div>';
    if (links.length) {
      html += '<p class="small muted" style="margin:0 2px 8px">便利リンク</p>' +
        links.map(function (e) { return entry(e, false); }).join('');
    }
    if (emergency.length) {
      html += '<p class="small muted" style="margin:14px 2px 8px">緊急連絡先</p>' +
        emergency.map(function (e) { return entry(e, true); }).join('');
    }
    html += '</section>';
    return html;
  }

  /* ======================================================================
   * 6. イベント処理
   * ==================================================================== */

  /** クリックされた要素が属する行の削除確認表示を切り替える */
  function closestRow(el) {
    return el.closest('[data-row]') || el.closest('.card') || null;
  }

  function clearConfirms() {
    $all('.is-confirming').forEach(function (el) { el.classList.remove('is-confirming'); });
  }

  var ACTIONS = {
    /* タブ・共通 */
    'goto': function (btn) {
      switchTab(btn.getAttribute('data-tab'));
    },
    'ask-delete': function (btn) {
      var row = closestRow(btn);
      clearConfirms();
      if (row) row.classList.add('is-confirming');
    },
    'cancel-delete': function () {
      clearConfirms();
    },

    /* ホーム */
    'trip-edit': function () {
      ui.tripEditing = true;
      renderHome();
    },
    'trip-cancel': function () {
      ui.tripEditing = false;
      renderHome();
    },
    'weather-retry': function () {
      loadWeather();
    },

    /* スケジュール */
    'sch-new': function () {
      ui.scheduleForm = {
        id: null,
        date: (state.trip && state.trip.start) || todayISO(),
        time: '',
        title: '',
        note: ''
      };
      renderSchedule();
      focusFirstField('#sch-title');
    },
    'sch-edit': function (btn) {
      var e = findById(state.schedule, btn.getAttribute('data-id'));
      if (!e) return;
      ui.scheduleForm = { id: e.id, date: e.date, time: e.time || '', title: e.title, note: e.note || '' };
      renderSchedule();
      focusFirstField('#sch-title');
    },
    'sch-cancel': function () {
      ui.scheduleForm = null;
      renderSchedule();
    },
    'sch-delete': function (btn) {
      var id = btn.getAttribute('data-id');
      state.schedule = state.schedule.filter(function (e) { return e.id !== id; });
      markDeleted('schedule', id);
      save('schedule');
      if (ui.scheduleForm && ui.scheduleForm.id === id) ui.scheduleForm = null;
      renderSchedule();
      toast('予定を削除しました');
    },

    /* リゾート情報 ⇄ 予定 の連携 */
    'poi-add-open': function (btn) {
      ui.poiForm = {
        cat: btn.getAttribute('data-cat') || '',
        name: btn.getAttribute('data-name') || '',
        from: btn.getAttribute('data-from') || 'list'
      };
      renderResort();
      focusFirstField(ui.poiForm.from === 'map' ? '#mappoi-date' : '#poi-date');
    },
    'poi-add-cancel': function () {
      ui.poiForm = null;
      renderResort();
    },
    'poi-toggle': function (btn) {
      var id = btn.getAttribute('data-id');
      if (!id) return;
      if (ui.openPoi[id]) delete ui.openPoi[id];
      else ui.openPoi[id] = true;
      renderCurrent();
    },

    /* 館内マップ */
    'map-pin': function (g) {
      if (mapGesture.moved) { mapGesture.moved = false; return; }   // ドラッグ直後は選択しない
      var index = Number(g.getAttribute('data-idx'));
      if (!isFinite(index)) return;
      ui.mapPin = (ui.mapPin === index) ? null : index;
      renderResort();
      if (ui.mapPin !== null) {
        var m = mapData();
        var pins = (m && Array.isArray(m.pins)) ? m.pins : [];
        centerMapOn(pins[ui.mapPin]);
      }
      var detail = $('#map-detail');
      if (detail && detail.scrollIntoView) detail.scrollIntoView({ block: 'nearest' });
    },
    'map-close': function () {
      ui.mapPin = null;
      renderResort();
    },
    'map-zoom': function (btn) {
      var dir = btn.getAttribute('data-dir');
      if (dir === 'in') setMapScale(mapView.scale * MAP_ZOOM_STEP);
      else if (dir === 'out') setMapScale(mapView.scale / MAP_ZOOM_STEP);
      else resetMapView();
    },

    /* リゾート情報 */
    'toggle-cat': function (btn) {
      var id = btn.getAttribute('data-id');
      ui.openCategories[id] = !ui.openCategories[id];
      var acc = btn.closest('.accordion');
      if (acc) {
        acc.classList.toggle('is-open', ui.openCategories[id]);
        btn.setAttribute('aria-expanded', ui.openCategories[id] ? 'true' : 'false');
      }
    },

    /* チェックリスト */
    'check-toggle': function (btn) {
      var item = findById(state.checklist, btn.getAttribute('data-id'));
      if (!item) return;
      item.done = !item.done;
      item.updatedAt = nowISO();
      save('checklist');
      renderChecklist();
    },
    'check-delete': function (btn) {
      var id = btn.getAttribute('data-id');
      state.checklist = state.checklist.filter(function (i) { return i.id !== id; });
      markDeleted('check', id);
      save('checklist');
      renderChecklist();
      toast('項目を削除しました');
    },
    'checklist-reset': function () {
      // テンプレート外の項目は削除マークを残してから作り直す
      state.checklist.forEach(function (i) {
        if (!/^tpl-\d+$/.test(i.id)) state.tombstones['check:' + i.id] = nowISO();
      });
      state.checklist = buildChecklistTemplate();
      save('tombstones');
      save('checklist');
      renderChecklist();
      toast('テンプレートに戻しました');
    },

    /* メモ */
    'note-new': function () {
      ui.noteForm = { id: null, title: '', body: '' };
      renderMemo();
      focusFirstField('#note-title');
    },
    'note-edit': function (btn) {
      var n = findById(state.notes, btn.getAttribute('data-id'));
      if (!n) return;
      ui.noteForm = { id: n.id, title: n.title, body: n.body || '' };
      renderMemo();
      focusFirstField('#note-title');
    },
    'note-cancel': function () {
      ui.noteForm = null;
      renderMemo();
    },
    'note-delete': function (btn) {
      var id = btn.getAttribute('data-id');
      state.notes = state.notes.filter(function (n) { return n.id !== id; });
      markDeleted('note', id);
      save('notes');
      if (ui.noteForm && ui.noteForm.id === id) ui.noteForm = null;
      renderMemo();
      toast('メモを削除しました');
    },

    /* お土産 */
    'sv-new': function () {
      ui.souvenirFormOpen = true;
      renderMemo();
      focusFirstField('#sv-who');
    },
    'sv-cancel': function () {
      ui.souvenirFormOpen = false;
      renderMemo();
    },
    'sv-toggle': function (btn) {
      var s = findById(state.souvenirs, btn.getAttribute('data-id'));
      if (!s) return;
      s.done = !s.done;
      s.updatedAt = nowISO();
      save('souvenirs');
      renderMemo();
    },
    'sv-delete': function (btn) {
      var id = btn.getAttribute('data-id');
      state.souvenirs = state.souvenirs.filter(function (s) { return s.id !== id; });
      markDeleted('souvenir', id);
      save('souvenirs');
      renderMemo();
      toast('お土産を削除しました');
    },

    /* 家族と共有 */
    'share-create': function () {
      if (ui.shareBusy) return;
      ui.shareBusy = 'create';
      ui.shareError = null;
      ui.shareErrorDetail = null;
      renderHome();
      Sync.create().then(function () {
        ui.shareBusy = null;
        ui.shareJoinOpen = false;
        ui.shareErrorDetail = null;
        renderHome();
        toast('共有IDを作成しました');
      }, function (err) {
        ui.shareBusy = null;
        ui.shareError = '共有IDを作成できませんでした。時間をおいて再度お試しください。';
        ui.shareErrorDetail = (err && err.message) ? err.message : null;
        renderHome();
      });
    },
    'share-join-open': function () {
      ui.shareJoinOpen = true;
      ui.shareError = null;
      ui.shareErrorDetail = null;
      renderHome();
      focusFirstField('#share-join-id');
    },
    'share-join-cancel': function () {
      ui.shareJoinOpen = false;
      ui.shareError = null;
      ui.shareErrorDetail = null;
      renderHome();
    },
    'share-leave': function () {
      Sync.leave();
      ui.shareError = null;
      ui.shareErrorDetail = null;
      ui.shareJoinOpen = false;
      renderHome();
      toast('共有を解除しました(データは端末に残ります)');
    },
    'share-test': function () {
      if (ui.shareBusy) return;
      ui.shareBusy = 'test';
      ui.shareError = null;
      ui.shareErrorDetail = null;
      renderHome();
      Sync.test().then(function (ok) {
        ui.shareBusy = null;
        renderHome();
        toast(ok ? '接続できました' : '接続できませんでした');
      });
    },
    'share-copy': function (btn) {
      var id = btn.getAttribute('data-id') || '';
      copyShareId(id);
    },
    'share-advanced-open': function () {
      ui.shareAdvancedOpen = true;
      renderHome();
      focusFirstField('#share-host');
    },
    'share-advanced-close': function () {
      ui.shareAdvancedOpen = false;
      renderHome();
    },
    'share-host-clear': function () {
      Sync.setFirebaseHost('');
      ui.shareError = null;
      ui.shareErrorDetail = null;
      renderHome();
      toast('データベースURLの設定を削除しました');
    }
  };

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function focusFirstField(sel) {
    var el = $(sel);
    if (el && typeof el.focus === 'function') el.focus();
  }

  document.addEventListener('click', function (ev) {
    var tabBtn = ev.target.closest ? ev.target.closest('.tabbar__btn') : null;
    if (tabBtn) {
      switchTab(tabBtn.getAttribute('data-tab'));
      return;
    }

    var actEl = ev.target.closest ? ev.target.closest('[data-act]') : null;
    if (!actEl) return;
    var act = actEl.getAttribute('data-act');
    var handler = ACTIONS[act];
    if (!handler) return;
    ev.preventDefault();
    handler(actEl);
  });

  document.addEventListener('submit', function (ev) {
    var form = ev.target;
    var kind = form.getAttribute && form.getAttribute('data-form');
    if (!kind) return;
    ev.preventDefault();

    var fd = new FormData(form);
    function val(name) {
      var v = fd.get(name);
      return v === null || v === undefined ? '' : String(v).trim();
    }

    if (kind === 'trip') {
      var start = val('start');
      var end = val('end');
      if (!start) { toast('開始日を入力してください'); return; }
      if (!end) end = start;
      if (diffDays(start, end) < 0) { var t = start; start = end; end = t; }
      state.trip = { start: start, end: end, updatedAt: nowISO() };
      save('trip');
      ui.tripEditing = false;
      renderHome();
      toast('旅行期間を保存しました');

    } else if (kind === 'schedule') {
      var title = val('title');
      if (!title) { toast('タイトルを入力してください'); return; }
      var date = val('date') || todayISO();
      var entry = { date: date, time: val('time'), title: title, note: val('note') };
      if (ui.scheduleForm && ui.scheduleForm.id) {
        var target = findById(state.schedule, ui.scheduleForm.id);
        if (target) {
          target.date = entry.date;
          target.time = entry.time;
          target.title = entry.title;
          target.note = entry.note;
          target.updatedAt = nowISO();
        }
        toast('予定を更新しました');
      } else {
        entry.id = uid();
        entry.updatedAt = nowISO();
        state.schedule.push(entry);
        toast('予定を追加しました');
      }
      save('schedule');
      ui.scheduleForm = null;
      renderSchedule();

    } else if (kind === 'poi-add') {
      var poiCat = form.getAttribute('data-cat') || '';
      var poiName = form.getAttribute('data-name') || '';
      if (!poiName) { ui.poiForm = null; renderResort(); return; }
      state.schedule.push({
        id: uid(),
        date: val('date') || defaultPoiDate(),
        time: val('time'),
        title: poiName,
        note: val('note'),
        poi: { cat: poiCat, name: poiName },   // 予定 → 施設情報への参照
        updatedAt: nowISO()
      });
      save('schedule');
      ui.poiForm = null;
      renderResort();          // リゾートタブに留まる
      toast('予定に追加しました');

    } else if (kind === 'check-add') {
      var text = val('text');
      if (!text) return;
      state.checklist.push({
        id: uid(),
        sec: form.getAttribute('data-sec') === 'todo' ? 'todo' : 'pack',
        text: text,
        done: false,
        updatedAt: nowISO()
      });
      save('checklist');
      var keep = $('[data-keep]', form);
      if (keep) keep.value = '';
      renderChecklist();

    } else if (kind === 'note') {
      var nTitle = val('title');
      if (!nTitle) { toast('タイトルを入力してください'); return; }
      var body = fd.get('body');
      body = body === null ? '' : String(body);
      if (ui.noteForm && ui.noteForm.id) {
        var note = findById(state.notes, ui.noteForm.id);
        if (note) {
          note.title = nTitle;
          note.body = body;
          note.updatedAt = nowISO();
        }
        toast('メモを更新しました');
      } else {
        state.notes.unshift({ id: uid(), title: nTitle, body: body, updatedAt: nowISO() });
        toast('メモを保存しました');
      }
      save('notes');
      ui.noteForm = null;
      renderMemo();

    } else if (kind === 'souvenir') {
      var who = val('who');
      var what = val('what');
      if (!who || !what) { toast('「誰に」と「何を」を入力してください'); return; }
      state.souvenirs.push({ id: uid(), who: who, what: what, done: false, updatedAt: nowISO() });
      save('souvenirs');
      ui.souvenirFormOpen = false;
      renderMemo();
      toast('お土産を追加しました');

    } else if (kind === 'share-host') {
      var host = val('host');
      var saved = Sync.setFirebaseHost(host);
      if (saved === false) {
        ui.shareError = 'データベースURLの形式が正しくありません(https:// から入力してください)。';
        ui.shareErrorDetail = null;
        renderHome();
        return;
      }
      ui.shareError = null;
      ui.shareErrorDetail = null;
      renderHome();
      toast(saved ? 'データベースURLを保存しました' : '設定を削除しました');

    } else if (kind === 'share-join') {
      var shareId = val('shareId');
      if (!shareId) { ui.shareError = '共有IDを入力してください'; renderHome(); return; }
      ui.shareBusy = 'join';
      ui.shareError = null;
      ui.shareErrorDetail = null;
      renderHome();
      Sync.join(shareId).then(function () {
        ui.shareBusy = null;
        ui.shareJoinOpen = false;
        renderHome();
        toast('共有に参加しました');
      }, function (err) {
        ui.shareBusy = null;
        ui.shareError = 'IDが違うか、サービスに接続できません。';
        ui.shareErrorDetail = (err && err.message) ? err.message : null;
        renderHome();
      });
    }
  });

  /* ======================================================================
   * 7. 起動
   * ==================================================================== */

  function init() {
    bindMapGestures();
    migrateForSync();
    Sync.init({
      store: store,
      buildLocalDoc: buildLocalDoc,
      applyDoc: applyDoc,
      onStatus: onSyncStatus
    });
    switchTab('home');
    loadWeather();

    // 日付が変わったらホームを描き直す(日をまたぐ長時間表示への対応)
    var lastDate = todayISO();
    setInterval(function () {
      var now = todayISO();
      if (now !== lastDate) {
        lastDate = now;
        renderCurrent();
      }
    }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
