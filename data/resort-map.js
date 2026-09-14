/**
 * フサキビーチリゾート 館内マップ(模式図)データ
 *
 * 公式ガイドマップ(https://www.fusaki.com/access/map)の配置を参照して作成したオリジナルの模式図。
 * 公式マップ画像そのものは著作権のためリポジトリに含めない。
 *
 * 座標系: viewBox 0 0 1000 700
 *   x 小 = 海側(西) / x 大 = 内陸側(東)
 *   y 小 = 北東側(ノースウイング側) / y 大 = 南西側(サウスウイング側)
 *   → 海(フサキビーチ)は左辺〜左下に帯状に配置される。
 *
 * 縮尺は厳密ではない。読みやすさを優先し、建物は「ヴィレッジ単位」のブロックに
 * 統合してある。面同士(建物・プール・道路・緑地)は重ならないよう配置している。
 *
 * pins[].rank … 地図上に名前を出す優先度
 *   1 = 等倍から常に表示する主要アンカー / 2 = 2倍以上 / 3 = 3倍以上
 */
window.RESORT_MAP = {
  updatedAt: "2026-09-14",
  officialMapUrl: "https://www.fusaki.com/access/map",

  areas: [
    {
      "id": "sea",
      "kind": "sea",
      "label": "東シナ海",
      "labelPos": {
        "x": 72,
        "y": 120
      },
      "d": "M0,0 L200,0 C150,120 190,240 160,360 C130,480 175,600 145,700 L0,700 Z",
      "points": null,
      "rect": null
    },
    {
      "id": "beach",
      "kind": "beach",
      "label": null,
      "labelPos": null,
      "d": "M200,0 L300,0 C250,120 290,240 260,360 C230,480 275,600 245,700 L145,700 C175,600 130,480 160,360 C190,240 150,120 200,0 Z",
      "points": null,
      "rect": null
    },
    {
      "id": "land",
      "kind": "green",
      "label": null,
      "labelPos": null,
      "d": "M300,0 L1000,0 L1000,700 L245,700 C275,600 230,480 260,360 C290,240 250,120 300,0 Z",
      "points": null,
      "rect": null
    },
    {
      "id": "hibanmui",
      "kind": "green2",
      "label": "火番森",
      "labelPos": {
        "x": 790,
        "y": 26
      },
      "rect": {
        "x": 600,
        "y": 0,
        "w": 380,
        "h": 34,
        "r": 12
      },
      "points": null,
      "d": null
    },
    {
      "id": "ayapani_forest",
      "kind": "green2",
      "label": "アヤパニの森",
      "labelPos": {
        "x": 432,
        "y": 570
      },
      "rect": {
        "x": 325,
        "y": 530,
        "w": 215,
        "h": 62,
        "r": 18
      },
      "points": null,
      "d": null
    },
    {
      "id": "promenade",
      "kind": "path",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 548,
        "y": 50,
        "w": 14,
        "h": 610,
        "r": 7
      },
      "points": null,
      "d": null
    },
    {
      "id": "service_road",
      "kind": "road",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 840,
        "y": 60,
        "w": 14,
        "h": 540,
        "r": 7
      },
      "points": null,
      "d": null
    },
    {
      "id": "entrance_road",
      "kind": "road",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 570,
        "y": 274,
        "w": 298,
        "h": 12,
        "r": 6
      },
      "points": null,
      "d": null
    },
    {
      "id": "pier_path",
      "kind": "path",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 250,
        "y": 400,
        "w": 298,
        "h": 12,
        "r": 6
      },
      "points": null,
      "d": null
    },
    {
      "id": "angel_pier",
      "kind": "pier",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 60,
        "y": 385,
        "w": 192,
        "h": 12,
        "r": 6
      },
      "points": null,
      "d": null
    },
    {
      "id": "kids_pool",
      "kind": "pool",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 325,
        "y": 180,
        "w": 45,
        "h": 60,
        "r": 16
      },
      "points": null,
      "d": null
    },
    {
      "id": "beachside_pool",
      "kind": "pool",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 380,
        "y": 180,
        "w": 160,
        "h": 60,
        "r": 20
      },
      "points": null,
      "d": null
    },
    {
      "id": "night_pool",
      "kind": "pool",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 325,
        "y": 258,
        "w": 215,
        "h": 50,
        "r": 20
      },
      "points": null,
      "d": null
    },
    {
      "id": "splash_park",
      "kind": "pool",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 325,
        "y": 326,
        "w": 215,
        "h": 60,
        "r": 22
      },
      "points": null,
      "d": null
    },
    {
      "id": "beach_station",
      "kind": "building",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 218,
        "y": 178,
        "w": 82,
        "h": 54,
        "r": 12
      },
      "points": null,
      "d": null
    },
    {
      "id": "aquagarden_block",
      "kind": "building",
      "label": "アクアガーデン",
      "labelPos": {
        "x": 432,
        "y": 106
      },
      "rect": {
        "x": 325,
        "y": 70,
        "w": 215,
        "h": 90,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "beach_grill",
      "kind": "building",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 262,
        "y": 270,
        "w": 56,
        "h": 60,
        "r": 12
      },
      "points": null,
      "d": null
    },
    {
      "id": "ayapani_block",
      "kind": "building",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 325,
        "y": 430,
        "w": 215,
        "h": 82,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "south_wing",
      "kind": "building",
      "label": "サウスウイング",
      "labelPos": {
        "x": 432,
        "y": 662
      },
      "rect": {
        "x": 325,
        "y": 612,
        "w": 215,
        "h": 78,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "north_wing",
      "kind": "building",
      "label": "ノースウイング",
      "labelPos": {
        "x": 700,
        "y": 76
      },
      "rect": {
        "x": 570,
        "y": 40,
        "w": 260,
        "h": 110,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "central_village",
      "kind": "building",
      "label": "セントラルヴィレッジ",
      "labelPos": {
        "x": 700,
        "y": 206
      },
      "rect": {
        "x": 570,
        "y": 170,
        "w": 260,
        "h": 100,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "garden_terrace",
      "kind": "building",
      "label": "ガーデンテラス",
      "labelPos": {
        "x": 700,
        "y": 326
      },
      "rect": {
        "x": 570,
        "y": 290,
        "w": 260,
        "h": 90,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "eight_stars",
      "kind": "building",
      "label": "エイトスターズ",
      "labelPos": {
        "x": 700,
        "y": 436
      },
      "rect": {
        "x": 570,
        "y": 400,
        "w": 260,
        "h": 100,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "garden_villas",
      "kind": "building",
      "label": "ガーデンヴィラズ",
      "labelPos": {
        "x": 700,
        "y": 556
      },
      "rect": {
        "x": 570,
        "y": 520,
        "w": 260,
        "h": 90,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "animal_square",
      "kind": "building",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 604,
        "y": 640,
        "w": 112,
        "h": 52,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "parking_p2",
      "kind": "parking",
      "label": "P2",
      "labelPos": {
        "x": 922,
        "y": 86
      },
      "rect": {
        "x": 858,
        "y": 60,
        "w": 128,
        "h": 80,
        "r": 12
      },
      "points": null,
      "d": null
    },
    {
      "id": "entrance_block",
      "kind": "building",
      "label": null,
      "labelPos": null,
      "rect": {
        "x": 858,
        "y": 160,
        "w": 128,
        "h": 100,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "wellness_block",
      "kind": "building",
      "label": "ウェルネス",
      "labelPos": {
        "x": 922,
        "y": 326
      },
      "rect": {
        "x": 858,
        "y": 290,
        "w": 128,
        "h": 140,
        "r": 14
      },
      "points": null,
      "d": null
    },
    {
      "id": "parking_p1",
      "kind": "parking",
      "label": "P1",
      "labelPos": {
        "x": 922,
        "y": 496
      },
      "rect": {
        "x": 858,
        "y": 470,
        "w": 128,
        "h": 100,
        "r": 12
      },
      "points": null,
      "d": null
    }
  ],

  pins: [
    {
      "cat": "dining",
      "name": "ISHIGAKI BOLD KITCHEN",
      "short": "BOLD KITCHEN",
      "icon": "🍽",
      "x": 640,
      "y": 104,
      "rank": 1
    },
    {
      "cat": "dining",
      "name": "Lounge bar ADAN",
      "short": "ADAN",
      "icon": "🍹",
      "x": 780,
      "y": 234,
      "rank": 2
    },
    {
      "cat": "dining",
      "name": "THE STAR BAR",
      "short": "STAR BAR",
      "icon": "🍸",
      "x": 385,
      "y": 134,
      "rank": 2
    },
    {
      "cat": "dining",
      "name": "Aqua Garden Cafe",
      "short": "カフェ",
      "icon": "🍔",
      "x": 495,
      "y": 134,
      "rank": 3
    },
    {
      "cat": "dining",
      "name": "BEACHSIDE GRILL 夏至南風(かちばい)",
      "short": "夏至南風",
      "icon": "🔥",
      "x": 297,
      "y": 300,
      "rank": 2
    },
    {
      "cat": "dining",
      "name": "HANARÉ(はなれ)",
      "short": "HANARÉ",
      "icon": "🍷",
      "x": 640,
      "y": 464,
      "rank": 3
    },
    {
      "cat": "dining",
      "name": "琉球新天地",
      "short": "琉球新天地",
      "icon": "🥢",
      "x": 770,
      "y": 354,
      "rank": 2
    },
    {
      "cat": "pool_beach",
      "name": "ビーチステーション",
      "short": "ビーチ受付",
      "icon": "🏄",
      "x": 245,
      "y": 205,
      "rank": 2
    },
    {
      "cat": "pool_beach",
      "name": "ナイトプール(20歳以上限定)",
      "short": "ナイトプール",
      "icon": "🌙",
      "x": 432,
      "y": 283,
      "rank": 3
    },
    {
      "cat": "pool_beach",
      "name": "ビーチサイドプール(アクアガーデン)",
      "short": "ビーチプール",
      "icon": "🏊",
      "x": 460,
      "y": 210,
      "rank": 2
    },
    {
      "cat": "pool_beach",
      "name": "キッズプール",
      "short": "キッズ",
      "icon": "🧒",
      "x": 347,
      "y": 210,
      "rank": 3
    },
    {
      "cat": "pool_beach",
      "name": "スプラッシュパーク",
      "short": "スプラッシュ",
      "icon": "💦",
      "x": 432,
      "y": 356,
      "rank": 1
    },
    {
      "cat": "pool_beach",
      "name": "インドアプール",
      "short": "室内プール",
      "icon": "🏊",
      "x": 922,
      "y": 356,
      "rank": 2
    },
    {
      "cat": "pool_beach",
      "name": "フサキビーチ",
      "short": "フサキビーチ",
      "icon": "🏖",
      "x": 230,
      "y": 500,
      "rank": 1
    },
    {
      "cat": "activities",
      "name": "ツアーデスク",
      "short": "ツアーデスク",
      "icon": "🗺",
      "x": 700,
      "y": 234,
      "rank": 3
    },
    {
      "cat": "activities",
      "name": "AYAPANI キッズプログラム(工作・ものづくり体験)",
      "short": "キッズ体験",
      "icon": "🎨",
      "x": 492,
      "y": 490,
      "rank": 3
    },
    {
      "cat": "activities",
      "name": "グラスボート遊覧(フサキクルーズ)",
      "short": "グラスボート",
      "icon": "⛵",
      "x": 165,
      "y": 440,
      "rank": 3
    },
    {
      "cat": "facilities",
      "name": "RESORT SHOP & MARKET",
      "short": "ショップ",
      "icon": "🛍",
      "x": 760,
      "y": 104,
      "rank": 2
    },
    {
      "cat": "facilities",
      "name": "ベビー&キッズルーム「AYAPANI」",
      "short": "AYAPANI",
      "icon": "🧸",
      "x": 372,
      "y": 490,
      "rank": 2
    },
    {
      "cat": "facilities",
      "name": "TERRACE SHOP",
      "short": "テラス店",
      "icon": "🏪",
      "x": 640,
      "y": 354,
      "rank": 3
    },
    {
      "cat": "facilities",
      "name": "大浴場",
      "short": "大浴場",
      "icon": "♨️",
      "x": 700,
      "y": 584,
      "rank": 1
    },
    {
      "cat": "facilities",
      "name": "FUSAKI SPA",
      "short": "スパ",
      "icon": "💆",
      "x": 770,
      "y": 464,
      "rank": 2
    },
    {
      "cat": "facilities",
      "name": "アニマルスクエア",
      "short": "アニマル",
      "icon": "🐐",
      "x": 660,
      "y": 666,
      "rank": 3
    },
    {
      "cat": "access",
      "name": "無料シャトルバス(南ぬ島石垣空港 ⇔ ホテル)",
      "short": "送迎バス",
      "icon": "🚌",
      "x": 922,
      "y": 186,
      "rank": 3
    },
    {
      "cat": null,
      "name": "フロント/ロビー(レセプション)",
      "short": "フロント",
      "icon": "🛎",
      "x": 620,
      "y": 234,
      "rank": 1
    },
    {
      "cat": null,
      "name": "エントランス/車寄せ",
      "short": "エントランス",
      "icon": "🚪",
      "x": 922,
      "y": 232,
      "rank": 2
    },
    {
      "cat": null,
      "name": "フサキエンジェルピア(桟橋)",
      "short": "桟橋",
      "icon": "🌅",
      "x": 120,
      "y": 391,
      "rank": 1
    },
    {
      "cat": null,
      "name": "フィットネスジム",
      "short": "ジム",
      "icon": "🏋",
      "x": 922,
      "y": 402,
      "rank": 3
    },
    {
      "cat": null,
      "name": "P2駐車場",
      "short": "P2",
      "icon": "🅿️",
      "x": 922,
      "y": 110,
      "rank": 2
    },
    {
      "cat": null,
      "name": "P1駐車場",
      "short": "P1",
      "icon": "🅿️",
      "x": 922,
      "y": 524,
      "rank": 2
    }
  ]
};
