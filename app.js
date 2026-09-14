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

  function buildChecklistTemplate() {
    return CHECKLIST_TEMPLATE.map(function (t) {
      return { id: uid(), sec: t.sec, text: t.text, done: false };
    });
  }

  function defaultTrip() {
    var start = todayISO();
    return { start: start, end: addDaysISO(start, 3) };
  }

  var state = {
    tab: 'home',
    trip: store.get('trip', null) || defaultTrip(),
    schedule: store.get('schedule', []),
    checklist: store.get('checklist', null),
    notes: store.get('notes', []),
    souvenirs: store.get('souvenirs', []),
    weather: { status: 'idle', data: null }   // idle | loading | ok | error
  };

  if (!Array.isArray(state.checklist)) {
    state.checklist = buildChecklistTemplate();
    store.set('checklist', state.checklist);
  }
  if (!Array.isArray(state.schedule)) state.schedule = [];
  if (!Array.isArray(state.notes)) state.notes = [];
  if (!Array.isArray(state.souvenirs)) state.souvenirs = [];

  /** 描画のみに使う一時的な UI 状態(保存しない) */
  var ui = {
    tripEditing: false,
    scheduleForm: null,   // null | { id: string|null, date, time, title, note }
    noteForm: null,       // null | { id: string|null, title, body }
    souvenirFormOpen: false,
    openCategories: {}    // リゾート情報アコーディオンの開閉
  };

  function save(key) {
    store.set(key, state[key]);
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
          '<div class="item">' +
            '<div class="item__time' + (e.time ? '' : ' is-empty') + '">' + esc(e.time || '終日') + '</div>' +
            '<div class="item__body">' +
              '<div class="item__title">' + esc(e.title) + '</div>' +
              (e.note ? '<div class="item__note">' + esc(e.note) + '</div>' : '') +
            '</div>' +
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
      '<div class="item" data-row="' + esc(e.id) + '">' +
        '<div class="item__time' + (e.time ? '' : ' is-empty') + '">' + esc(e.time || '終日') + '</div>' +
        '<div class="item__body">' +
          '<div class="item__title">' + esc(e.title) + '</div>' +
          (e.note ? '<div class="item__note">' + esc(e.note) + '</div>' : '') +
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

    var html = renderHotelCard(data.hotel);

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
              (items.length ? items.map(renderPoi).join('') : '<p class="small muted" style="padding-top:12px">情報がありません。</p>') +
            '</div>' +
          '</section>';
      }).join('');
    }

    if (data.updatedAt) {
      html += '<p class="small muted" style="text-align:center;margin-top:16px">データ更新日: ' + esc(data.updatedAt) + '</p>';
    }

    renderPanel('resort', html);
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

  function renderLinkChips(obj) {
    var chips = [];
    var tel = telHref(obj.tel);
    if (tel) chips.push('<a class="chip" href="' + esc(tel) + '">📞 電話する</a>');
    var url = safeUrl(obj.url);
    if (url) chips.push('<a class="chip" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">🔗 公式サイト</a>');
    var map = safeUrl(obj.mapUrl);
    if (map) chips.push('<a class="chip" href="' + esc(map) + '" target="_blank" rel="noopener noreferrer">🗺 地図</a>');
    return chips.length ? '<div class="chip-row">' + chips.join('') + '</div>' : '';
  }

  function renderPoi(item) {
    if (!item || typeof item !== 'object') return '';
    var meta = '';
    if (item.hours) meta += '<span>🕒 ' + esc(item.hours) + '</span>';
    if (item.location) meta += '<span>📍 ' + esc(item.location) + '</span>';

    return '' +
      '<article class="poi">' +
        '<h3 class="poi__name">' + esc(item.name || '') + '</h3>' +
        (item.description ? '<p class="poi__desc">' + esc(item.description) + '</p>' : '') +
        (meta ? '<div class="poi__meta">' + meta + '</div>' : '') +
        (item.tips ? '<p class="poi__tips">💡 ' + esc(item.tips) + '</p>' : '') +
        renderLinkChips(item) +
      '</article>';
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
      save('schedule');
      if (ui.scheduleForm && ui.scheduleForm.id === id) ui.scheduleForm = null;
      renderSchedule();
      toast('予定を削除しました');
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
      save('checklist');
      renderChecklist();
    },
    'check-delete': function (btn) {
      var id = btn.getAttribute('data-id');
      state.checklist = state.checklist.filter(function (i) { return i.id !== id; });
      save('checklist');
      renderChecklist();
      toast('項目を削除しました');
    },
    'checklist-reset': function () {
      state.checklist = buildChecklistTemplate();
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
      save('souvenirs');
      renderMemo();
    },
    'sv-delete': function (btn) {
      var id = btn.getAttribute('data-id');
      state.souvenirs = state.souvenirs.filter(function (s) { return s.id !== id; });
      save('souvenirs');
      renderMemo();
      toast('お土産を削除しました');
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
      state.trip = { start: start, end: end };
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
        }
        toast('予定を更新しました');
      } else {
        entry.id = uid();
        state.schedule.push(entry);
        toast('予定を追加しました');
      }
      save('schedule');
      ui.scheduleForm = null;
      renderSchedule();

    } else if (kind === 'check-add') {
      var text = val('text');
      if (!text) return;
      state.checklist.push({
        id: uid(),
        sec: form.getAttribute('data-sec') === 'todo' ? 'todo' : 'pack',
        text: text,
        done: false
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
          note.updatedAt = Date.now();
        }
        toast('メモを更新しました');
      } else {
        state.notes.unshift({ id: uid(), title: nTitle, body: body, updatedAt: Date.now() });
        toast('メモを保存しました');
      }
      save('notes');
      ui.noteForm = null;
      renderMemo();

    } else if (kind === 'souvenir') {
      var who = val('who');
      var what = val('what');
      if (!who || !what) { toast('「誰に」と「何を」を入力してください'); return; }
      state.souvenirs.push({ id: uid(), who: who, what: what, done: false });
      save('souvenirs');
      ui.souvenirFormOpen = false;
      renderMemo();
      toast('お土産を追加しました');
    }
  });

  /* ======================================================================
   * 7. 起動
   * ==================================================================== */

  function init() {
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
