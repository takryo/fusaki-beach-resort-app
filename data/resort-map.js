/**
 * フサキビーチリゾート 館内マップ(模式図)データ
 *
 * 公式ガイドマップ(https://www.fusaki.com/access/map)の配置を参照して作成したオリジナルの模式図。
 * 公式マップ画像そのものは著作権のためリポジトリに含めない。
 *
 * 座標系: viewBox 0 0 1000 700
 *   公式マップは「海が上・南西が左・北東が右」の横長図だが、本データは仕様に合わせて
 *   反時計回りに90度回転させている(回転のみで鏡像反転はしていないため左右関係は保たれる)。
 *     x 小 = 海側(西)  /  x 大 = 内陸側(東)
 *     y 小 = 北東側(ノースウイング・セントラルヴィレッジ側)
 *     y 大 = 南西側(サウスウイング・アニマルスクエア側)
 *   → 海(フサキビーチ)は左辺〜左下に帯状に配置される。
 *
 * 縮尺は厳密ではない。公式マップは横に細長い(長辺:奥行き ≒ 4.6:1)ため、
 * 本図では読みやすさを優先して奥行き方向を大きく引き伸ばしてある。
 */
window.RESORT_MAP = {
  updatedAt: "2026-09-14",
  officialMapUrl: "https://www.fusaki.com/access/map",

  areas: [
    /* ---- 海 ---- */
    {
      id: "sea",
      kind: "sea",
      label: "東シナ海",
      labelPos: { x: 62, y: 120 },
      points: "0,0 264,0 209,67 161,190 133,313 117,436 133,559 145,682 145,700 0,700",
      rect: null
    },

    /* ---- ビーチ(砂浜) ---- */
    {
      id: "beach",
      kind: "beach",
      label: null,
      labelPos: null,
      points: "264,0 361,0 334,67 292,190 264,313 245,436 256,559 264,682 264,700 145,700 145,682 133,559 117,436 133,313 161,190 209,67",
      rect: null
    },

    /* ---- 陸地(全体の緑) ---- */
    {
      id: "land",
      kind: "green",
      label: null,
      labelPos: null,
      points: "361,0 1000,0 1000,700 264,700 264,682 256,559 245,436 264,313 292,190 334,67",
      rect: null
    },

    /* ---- 緑地・森 ---- */
    {
      id: "hibanmui",
      kind: "green",
      label: "火番森",
      labelPos: { x: 640, y: 24 },
      rect: { x: 430, y: 0, w: 480, h: 46, r: 14 },
      points: null
    },
    {
      id: "ayapani_forest",
      kind: "green",
      label: "アヤパニの森",
      labelPos: { x: 362, y: 430 },
      rect: { x: 264, y: 360, w: 198, h: 140, r: 26 },
      points: null
    },
    {
      id: "south_green",
      kind: "green",
      label: null,
      labelPos: null,
      rect: { x: 264, y: 560, w: 300, h: 140, r: 26 },
      points: null
    },

    /* ---- 園路・道路 ---- */
    {
      id: "main_path",
      kind: "path",
      label: null,
      labelPos: null,
      rect: { x: 508, y: 60, w: 26, h: 600, r: 13 },
      points: null
    },
    {
      id: "main_road",
      kind: "road",
      label: null,
      labelPos: null,
      rect: { x: 862, y: 60, w: 34, h: 560, r: 17 },
      points: null
    },
    {
      id: "entrance_road",
      kind: "road",
      label: null,
      labelPos: null,
      rect: { x: 760, y: 176, w: 136, h: 26, r: 13 },
      points: null
    },
    {
      id: "pier_path",
      kind: "path",
      label: null,
      labelPos: null,
      rect: { x: 250, y: 386, w: 260, h: 16, r: 8 },
      points: null
    },
    {
      id: "aquagarden_path",
      kind: "path",
      label: null,
      labelPos: null,
      rect: { x: 330, y: 246, w: 190, h: 16, r: 8 },
      points: null
    },

    /* ---- 桟橋 ---- */
    {
      id: "angel_pier",
      kind: "path",
      label: "フサキエンジェルピア",
      labelPos: { x: 148, y: 372 },
      rect: { x: 40, y: 388, w: 214, h: 14, r: 7 },
      points: null
    },

    /* ---- プール ---- */
    {
      id: "splash_park",
      kind: "pool",
      label: null,
      labelPos: null,
      rect: { x: 328, y: 282, w: 118, h: 40, r: 20 },
      points: null
    },
    {
      id: "kids_pool",
      kind: "pool",
      label: null,
      labelPos: null,
      rect: { x: 318, y: 252, w: 68, h: 26, r: 13 },
      points: null
    },
    {
      id: "beachside_pool",
      kind: "pool",
      label: null,
      labelPos: null,
      rect: { x: 386, y: 222, w: 96, h: 58, r: 10 },
      points: null
    },
    {
      id: "indoor_pool_water",
      kind: "pool",
      label: null,
      labelPos: null,
      rect: { x: 742, y: 336, w: 60, h: 34, r: 8 },
      points: null
    },

    /* ---- 建物群 ---- */
    {
      id: "north_wing",
      kind: "building",
      label: "ノースウイング",
      labelPos: { x: 636, y: 72 },
      rect: { x: 498, y: 18, w: 286, h: 112, r: 10 },
      points: null
    },
    {
      id: "central_village",
      kind: "building",
      label: "セントラルヴィレッジ",
      labelPos: { x: 648, y: 243 },
      rect: { x: 570, y: 126, w: 244, h: 84, r: 10 },
      points: null
    },
    {
      id: "garden_terrace",
      kind: "building",
      label: "ガーデンテラス",
      labelPos: { x: 712, y: 268 },
      rect: { x: 584, y: 216, w: 252, h: 88, r: 10 },
      points: null
    },
    {
      id: "garden_villas_center",
      kind: "building",
      label: "ガーデンヴィラズ",
      labelPos: { x: 660, y: 322 },
      rect: { x: 486, y: 306, w: 350, h: 54, r: 10 },
      points: null
    },
    {
      id: "eight_stars_village",
      kind: "building",
      label: "エイトスターズヴィレッジ",
      labelPos: { x: 640, y: 470 },
      rect: { x: 624, y: 362, w: 214, h: 96, r: 10 },
      points: null
    },
    {
      id: "garden_villas_west",
      kind: "building",
      label: "ガーデンヴィラズ",
      labelPos: { x: 740, y: 522 },
      rect: { x: 640, y: 476, w: 196, h: 92, r: 10 },
      points: null
    },
    {
      id: "south_wing",
      kind: "building",
      label: "サウスウイング",
      labelPos: { x: 508, y: 598 },
      rect: { x: 452, y: 524, w: 112, h: 100, r: 10 },
      points: null
    },
    {
      id: "aquagarden_block",
      kind: "building",
      label: null,
      labelPos: null,
      rect: { x: 486, y: 196, w: 110, h: 72, r: 10 },
      points: null
    },
    {
      id: "hanare_block",
      kind: "building",
      label: null,
      labelPos: null,
      rect: { x: 540, y: 396, w: 62, h: 40, r: 8 },
      points: null
    },
    {
      id: "animal_square_block",
      kind: "building",
      label: null,
      labelPos: null,
      rect: { x: 552, y: 636, w: 62, h: 44, r: 8 },
      points: null
    },
    {
      id: "parking_p1",
      kind: "road",
      label: "P1",
      labelPos: { x: 931, y: 430 },
      rect: { x: 890, y: 392, w: 86, h: 74, r: 8 },
      points: null
    },
    {
      id: "parking_p2",
      kind: "road",
      label: "P2",
      labelPos: { x: 828, y: 135 },
      rect: { x: 790, y: 100, w: 80, h: 66, r: 8 },
      points: null
    }
  ],

  pins: [
    /* ===== レストラン&バー ===== */
    { cat: "dining", name: "ISHIGAKI BOLD KITCHEN", short: "BOLD KITCHEN", icon: "🍽", x: 678, y: 130 },
    { cat: "dining", name: "Lounge bar ADAN", short: "ADAN", icon: "🍹", x: 567, y: 181 },
    { cat: "dining", name: "THE STAR BAR", short: "STAR BAR", icon: "🍸", x: 428, y: 218 },
    { cat: "dining", name: "Aqua Garden Cafe", short: "アクアガーデンカフェ", icon: "🍔", x: 556, y: 250 },
    { cat: "dining", name: "BEACHSIDE GRILL 夏至南風(かちばい)", short: "夏至南風", icon: "🔥", x: 352, y: 354 },
    { cat: "dining", name: "HANARÉ(はなれ)", short: "HANARÉ", icon: "🍷", x: 567, y: 415 },
    { cat: "dining", name: "琉球新天地", short: "琉球新天地", icon: "🥢", x: 734, y: 439 },

    /* ===== プール&ビーチ ===== */
    { cat: "pool_beach", name: "ビーチステーション", short: "ビーチステーション", icon: "🏄", x: 378, y: 203 },
    { cat: "pool_beach", name: "ナイトプール(20歳以上限定)", short: "ナイトプール", icon: "🌙", x: 470, y: 232 },
    { cat: "pool_beach", name: "ビーチサイドプール(アクアガーデン)", short: "ビーチサイドプール", icon: "🏊", x: 425, y: 275 },
    { cat: "pool_beach", name: "キッズプール", short: "キッズプール", icon: "🧒", x: 336, y: 262 },
    { cat: "pool_beach", name: "スプラッシュパーク", short: "スプラッシュパーク", icon: "💦", x: 381, y: 316 },
    { cat: "pool_beach", name: "インドアプール", short: "インドアプール", icon: "🏊", x: 770, y: 352 },
    { cat: "pool_beach", name: "フサキビーチ", short: "フサキビーチ", icon: "🏖", x: 150, y: 470 },

    /* ===== アクティビティ ===== */
    { cat: "activities", name: "ツアーデスク", short: "ツアーデスク", icon: "🗺", x: 623, y: 182 },
    { cat: "activities", name: "AYAPANI キッズプログラム(工作・ものづくり体験)", short: "キッズプログラム", icon: "🎨", x: 535, y: 340 },
    { cat: "activities", name: "グラスボート遊覧(フサキクルーズ)", short: "グラスボート", icon: "⛵", x: 210, y: 394 },

    /* ===== 館内施設 ===== */
    { cat: "facilities", name: "RESORT SHOP & MARKET", short: "リゾートショップ", icon: "🛍", x: 592, y: 138 },
    { cat: "facilities", name: "ベビー&キッズルーム「AYAPANI」", short: "AYAPANI", icon: "🧸", x: 492, y: 298 },
    { cat: "facilities", name: "TERRACE SHOP", short: "テラスショップ", icon: "🏪", x: 620, y: 355 },
    { cat: "facilities", name: "大浴場", short: "大浴場", icon: "♨️", x: 714, y: 374 },
    { cat: "facilities", name: "FUSAKI SPA", short: "フサキスパ", icon: "💆", x: 665, y: 415 },
    { cat: "facilities", name: "アニマルスクエア", short: "アニマルスクエア", icon: "🐐", x: 581, y: 636 },

    /* ===== アクセス ===== */
    { cat: "access", name: "無料シャトルバス(南ぬ島石垣空港 ⇔ ホテル)", short: "送迎バス乗り場", icon: "🚌", x: 742, y: 108 },

    /* ===== resort-data に対応項目がない場所 ===== */
    { cat: null, name: "フロント/ロビー(レセプション)", short: "フロント", icon: "🛎", x: 717, y: 191 },
    { cat: null, name: "エントランス/車寄せ", short: "エントランス", icon: "🚪", x: 806, y: 190 },
    { cat: null, name: "フサキエンジェルピア(桟橋)", short: "桟橋", icon: "🌅", x: 110, y: 394 },
    { cat: null, name: "フィットネスジム", short: "ジム", icon: "🏋", x: 790, y: 400 },
    { cat: null, name: "P2駐車場", short: "P2", icon: "🅿️", x: 828, y: 131 },
    { cat: null, name: "P1駐車場", short: "P1", icon: "🅿️", x: 931, y: 426 }
  ]
};
