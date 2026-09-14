/* フサキビーチリゾート 館内マップ データ v3
 * 公式ガイドマップ(2026年3月版)の配置・部屋番号レンジを読み取り、
 * viewBox 1800x640 の模式図座標に変換したもの(画像は含まない)。
 * 生成: scratchpad/gen-map-v3.js
 */
window.RESORT_MAP = {
  version: 3,
  updatedAt: "2026-09-14",
  officialMapUrl: "https://www.fusaki.com/access/map",
  viewBox: {
    w: 1800,
    h: 640
  },
  metersPerUnit: 0.43,
  areas: [
    {
      id: "sea",
      kind: "sea",
      label: "東シナ海",
      labelPos: {
        x: 107,
        y: 69
      },
      rect: {
        x: 0,
        y: 0,
        w: 1800,
        h: 213,
        r: 0
      }
    },
    {
      id: "beach",
      kind: "beach",
      label: null,
      labelPos: null,
      points: "0,152 305,148 611,142 763,148 855,157 977,163 1069,160 1160,152 1313,142 1450,110 1603,61 1710,34 1771,43 1800,61 1800,91 1771,69 1710,61 1603,91 1450,145 1313,180 1160,191 1069,198 977,201 855,195 763,186 682,183 611,180 305,186 0,191"
    },
    {
      id: "ground",
      kind: "green2",
      label: null,
      labelPos: null,
      points: "0,191 305,186 611,180 682,183 763,186 855,195 977,201 1069,198 1160,191 1313,180 1450,145 1603,91 1710,61 1771,69 1800,91 1800,640 0,640"
    },
    {
      id: "ayapani-forest",
      kind: "green",
      label: "アヤパニの森",
      labelPos: {
        x: 527,
        y: 229
      },
      points: "366,191 458,183 611,180 687,191 695,267 611,290 458,293 374,274"
    },
    {
      id: "hibanmui-forest",
      kind: "green",
      label: "火番森",
      labelPos: {
        x: 1526,
        y: 130
      },
      points: "1374,171 1465,137 1588,95 1694,69 1763,76 1794,99 1794,183 1679,229 1526,229 1404,206"
    },
    {
      id: "splash",
      kind: "pool",
      label: null,
      labelPos: null,
      d: "M898,218 a31,30 0 1,0 61,0 a31,30 0 1,0 -61,0"
    },
    {
      id: "beachside-pool",
      kind: "pool",
      label: null,
      labelPos: null,
      rect: {
        x: 988,
        y: 209,
        w: 118,
        h: 37,
        r: 6
      }
    },
    {
      id: "pier",
      kind: "pier",
      label: null,
      labelPos: null,
      rect: {
        x: 678,
        y: 58,
        w: 9,
        h: 259,
        r: 2
      }
    },
    {
      id: "p1",
      kind: "parking",
      label: "P1",
      labelPos: {
        x: 632,
        y: 476
      },
      rect: {
        x: 592,
        y: 457,
        w: 79,
        h: 27,
        r: 4
      }
    },
    {
      id: "p2",
      kind: "parking",
      label: "P2",
      labelPos: {
        x: 1340,
        y: 445
      },
      rect: {
        x: 1313,
        y: 424,
        w: 55,
        h: 37,
        r: 4
      }
    },
    {
      id: "road-main",
      kind: "road",
      label: null,
      labelPos: null,
      points: "31,503 305,495 458,485 595,477 717,473 931,473 1084,473 1206,457 1279,454 1381,506 1412,639"
    },
    {
      id: "road-p2",
      kind: "road",
      label: null,
      labelPos: null,
      points: "1279,454 1316,442"
    },
    {
      id: "path-A-B",
      kind: "path",
      label: null,
      labelPos: null,
      points: "55,313 150,328"
    },
    {
      id: "path-B-C",
      kind: "path",
      label: null,
      labelPos: null,
      points: "150,328 218,328"
    },
    {
      id: "path-C-D",
      kind: "path",
      label: null,
      labelPos: null,
      points: "218,328 287,328"
    },
    {
      id: "path-D-E",
      kind: "path",
      label: null,
      labelPos: null,
      points: "287,328 386,325"
    },
    {
      id: "path-E-F",
      kind: "path",
      label: null,
      labelPos: null,
      points: "386,325 458,316"
    },
    {
      id: "path-F-G",
      kind: "path",
      label: null,
      labelPos: null,
      points: "458,316 519,316"
    },
    {
      id: "path-G-H",
      kind: "path",
      label: null,
      labelPos: null,
      points: "519,316 580,316"
    },
    {
      id: "path-H-I",
      kind: "path",
      label: null,
      labelPos: null,
      points: "580,316 641,316"
    },
    {
      id: "path-I-J",
      kind: "path",
      label: null,
      labelPos: null,
      points: "641,316 682,316"
    },
    {
      id: "path-J-M",
      kind: "path",
      label: null,
      labelPos: null,
      points: "682,316 778,316"
    },
    {
      id: "path-M-N",
      kind: "path",
      label: null,
      labelPos: null,
      points: "778,316 855,316"
    },
    {
      id: "path-N-O",
      kind: "path",
      label: null,
      labelPos: null,
      points: "855,316 931,316"
    },
    {
      id: "path-O-P",
      kind: "path",
      label: null,
      labelPos: null,
      points: "931,316 992,316"
    },
    {
      id: "path-P-Q",
      kind: "path",
      label: null,
      labelPos: null,
      points: "992,316 1069,313"
    },
    {
      id: "path-Q-R",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1069,313 1175,335"
    },
    {
      id: "path-R-S",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1175,335 1221,358"
    },
    {
      id: "path-S-T",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1221,358 1252,399"
    },
    {
      id: "path-T-U",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1252,399 1313,442"
    },
    {
      id: "path-S-V",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1221,358 1359,366"
    },
    {
      id: "path-V-W",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1359,366 1420,328"
    },
    {
      id: "path-W-X",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1420,328 1526,313"
    },
    {
      id: "path-X-Y",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1526,313 1633,300"
    },
    {
      id: "path-Y-Z",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1633,300 1710,290"
    },
    {
      id: "path-Z-AA",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1710,290 1755,198"
    },
    {
      id: "path-W-AB",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1420,328 1420,404"
    },
    {
      id: "path-AB-AC",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1420,404 1542,393"
    },
    {
      id: "path-AC-X",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1542,393 1526,313"
    },
    {
      id: "path-J-K",
      kind: "path",
      label: null,
      labelPos: null,
      points: "682,316 682,152"
    },
    {
      id: "path-K-L",
      kind: "path",
      label: null,
      labelPos: null,
      points: "682,152 682,84"
    },
    {
      id: "path-K-BC",
      kind: "path",
      label: null,
      labelPos: null,
      points: "682,152 824,168"
    },
    {
      id: "path-BC-AW",
      kind: "path",
      label: null,
      labelPos: null,
      points: "824,168 849,259"
    },
    {
      id: "path-N-AW",
      kind: "path",
      label: null,
      labelPos: null,
      points: "855,316 849,259"
    },
    {
      id: "path-AW-AX",
      kind: "path",
      label: null,
      labelPos: null,
      points: "849,259 931,259"
    },
    {
      id: "path-AX-AY",
      kind: "path",
      label: null,
      labelPos: null,
      points: "931,259 1007,259"
    },
    {
      id: "path-AY-AZ",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1007,259 1137,259"
    },
    {
      id: "path-AZ-BA",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1137,259 1175,282"
    },
    {
      id: "path-BA-R",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1175,282 1175,335"
    },
    {
      id: "path-I-AD",
      kind: "path",
      label: null,
      labelPos: null,
      points: "641,316 641,381"
    },
    {
      id: "path-AD-AF",
      kind: "path",
      label: null,
      labelPos: null,
      points: "641,381 638,463"
    },
    {
      id: "path-F-AI",
      kind: "path",
      label: null,
      labelPos: null,
      points: "458,316 458,358"
    },
    {
      id: "path-AI-AH",
      kind: "path",
      label: null,
      labelPos: null,
      points: "458,358 458,412"
    },
    {
      id: "path-AH-AG",
      kind: "path",
      label: null,
      labelPos: null,
      points: "458,412 504,457"
    },
    {
      id: "path-AG-AK",
      kind: "path",
      label: null,
      labelPos: null,
      points: "504,457 565,457"
    },
    {
      id: "path-AK-AF",
      kind: "path",
      label: null,
      labelPos: null,
      points: "565,457 638,463"
    },
    {
      id: "path-H-AJ",
      kind: "path",
      label: null,
      labelPos: null,
      points: "580,316 550,389"
    },
    {
      id: "path-AJ-AK",
      kind: "path",
      label: null,
      labelPos: null,
      points: "550,389 565,457"
    },
    {
      id: "path-M-AL",
      kind: "path",
      label: null,
      labelPos: null,
      points: "778,316 778,396"
    },
    {
      id: "path-AL-AM",
      kind: "path",
      label: null,
      labelPos: null,
      points: "778,396 855,396"
    },
    {
      id: "path-AM-AN",
      kind: "path",
      label: null,
      labelPos: null,
      points: "855,396 931,396"
    },
    {
      id: "path-AN-AR",
      kind: "path",
      label: null,
      labelPos: null,
      points: "931,396 1000,396"
    },
    {
      id: "path-AR-AS",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1000,396 1084,396"
    },
    {
      id: "path-N-AM",
      kind: "path",
      label: null,
      labelPos: null,
      points: "855,316 855,396"
    },
    {
      id: "path-O-AN",
      kind: "path",
      label: null,
      labelPos: null,
      points: "931,316 931,396"
    },
    {
      id: "path-P-AR",
      kind: "path",
      label: null,
      labelPos: null,
      points: "992,316 1000,396"
    },
    {
      id: "path-AL-AQ",
      kind: "path",
      label: null,
      labelPos: null,
      points: "778,396 778,473"
    },
    {
      id: "path-AM-AP",
      kind: "path",
      label: null,
      labelPos: null,
      points: "855,396 855,473"
    },
    {
      id: "path-AN-AO",
      kind: "path",
      label: null,
      labelPos: null,
      points: "931,396 931,473"
    },
    {
      id: "path-AR-AU",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1000,396 1000,473"
    },
    {
      id: "path-AS-AT",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1084,396 1084,473"
    },
    {
      id: "path-U-V",
      kind: "path",
      label: null,
      labelPos: null,
      points: "1313,442 1359,366"
    },
    {
      id: "lbl-0",
      kind: "green2",
      label: "サウスウイング",
      labelPos: {
        x: 259,
        y: 271
      },
      rect: {
        x: 258,
        y: 270,
        w: 2,
        h: 2,
        r: 0
      }
    },
    {
      id: "lbl-1",
      kind: "green2",
      label: "ガーデンヴィラズ",
      labelPos: {
        x: 504,
        y: 482
      },
      rect: {
        x: 503,
        y: 481,
        w: 2,
        h: 2,
        r: 0
      }
    },
    {
      id: "lbl-2",
      kind: "green2",
      label: "ガーデンヴィラズ",
      labelPos: {
        x: 855,
        y: 375
      },
      rect: {
        x: 854,
        y: 374,
        w: 2,
        h: 2,
        r: 0
      }
    },
    {
      id: "lbl-3",
      kind: "green2",
      label: "ガーデンテラス",
      labelPos: {
        x: 1036,
        y: 320
      },
      rect: {
        x: 1035,
        y: 319,
        w: 2,
        h: 2,
        r: 0
      }
    },
    {
      id: "lbl-4",
      kind: "green2",
      label: "ノースウイング",
      labelPos: {
        x: 1526,
        y: 238
      },
      rect: {
        x: 1525,
        y: 237,
        w: 2,
        h: 2,
        r: 0
      }
    },
    {
      id: "lbl-5",
      kind: "green2",
      label: "セントラルヴィレッジ",
      labelPos: {
        x: 1236,
        y: 290
      },
      rect: {
        x: 1235,
        y: 289,
        w: 2,
        h: 2,
        r: 0
      }
    },
    {
      id: "lbl-6",
      kind: "green2",
      label: "アクアガーデン",
      labelPos: {
        x: 1007,
        y: 186
      },
      rect: {
        x: 1006,
        y: 185,
        w: 2,
        h: 2,
        r: 0
      }
    },
    {
      id: "lbl-7",
      kind: "green2",
      label: "フサキビーチ",
      labelPos: {
        x: 382,
        y: 165
      },
      rect: {
        x: 381,
        y: 164,
        w: 2,
        h: 2,
        r: 0
      }
    }
  ],
  buildings: [
    {
      id: "sw1",
      group: "サウスウイング",
      label: "S117-122",
      rect: {
        x: 110,
        y: 286,
        w: 81,
        h: 32,
        r: 3
      },
      cx: 150,
      cy: 302,
      rooms: [
        {
          prefix: "S",
          from: 117,
          to: 122
        },
        {
          prefix: "S",
          from: 217,
          to: 222
        },
        {
          prefix: "S",
          from: 316,
          to: 321
        }
      ],
      node: "B"
    },
    {
      id: "sw2",
      group: "サウスウイング",
      label: "S113-116",
      rect: {
        x: 195,
        y: 283,
        w: 50,
        h: 35,
        r: 3
      },
      cx: 220,
      cy: 300,
      rooms: [
        {
          prefix: "S",
          from: 113,
          to: 116
        },
        {
          prefix: "S",
          from: 213,
          to: 216
        },
        {
          prefix: "S",
          from: 312,
          to: 315
        }
      ],
      node: "C"
    },
    {
      id: "sw3",
      group: "サウスウイング",
      label: "S107-112",
      rect: {
        x: 250,
        y: 283,
        w: 73,
        h: 35,
        r: 3
      },
      cx: 286,
      cy: 300,
      rooms: [
        {
          prefix: "S",
          from: 107,
          to: 112
        },
        {
          prefix: "S",
          from: 207,
          to: 212
        },
        {
          prefix: "S",
          from: 306,
          to: 311
        }
      ],
      node: "D"
    },
    {
      id: "sw4",
      group: "サウスウイング",
      label: "S101-106",
      rect: {
        x: 348,
        y: 283,
        w: 76,
        h: 32,
        r: 3
      },
      cx: 386,
      cy: 299,
      rooms: [
        {
          prefix: "S",
          from: 101,
          to: 106
        },
        {
          prefix: "S",
          from: 201,
          to: 206
        },
        {
          prefix: "S",
          from: 301,
          to: 305
        }
      ],
      node: "E"
    },
    {
      id: "nw1",
      group: "ノースウイング",
      label: "N101-115",
      rect: {
        x: 1380,
        y: 280,
        w: 92,
        h: 38,
        r: 3
      },
      cx: 1426,
      cy: 299,
      rooms: [
        {
          prefix: "N",
          from: 101,
          to: 115
        },
        {
          prefix: "N",
          from: 201,
          to: 215
        },
        {
          prefix: "N",
          from: 301,
          to: 307
        }
      ],
      node: "W"
    },
    {
      id: "nw2",
      group: "ノースウイング",
      label: "N116-137",
      rect: {
        x: 1478,
        y: 259,
        w: 113,
        h: 43,
        r: 3
      },
      cx: 1534,
      cy: 281,
      rooms: [
        {
          prefix: "N",
          from: 116,
          to: 137
        },
        {
          prefix: "N",
          from: 216,
          to: 237
        },
        {
          prefix: "N",
          from: 308,
          to: 319
        }
      ],
      node: "X"
    },
    {
      id: "nw3",
      group: "ノースウイング",
      label: "N138-145",
      rect: {
        x: 1611,
        y: 252,
        w: 93,
        h: 38,
        r: 3
      },
      cx: 1658,
      cy: 271,
      rooms: [
        {
          prefix: "N",
          from: 138,
          to: 145
        },
        {
          prefix: "N",
          from: 238,
          to: 245
        },
        {
          prefix: "N",
          from: 320,
          to: 327
        }
      ],
      node: "Y"
    },
    {
      id: "nw4",
      group: "ノースウイング",
      label: "N146-153",
      rect: {
        x: 1373,
        y: 360,
        w: 81,
        h: 40,
        r: 3
      },
      cx: 1414,
      cy: 380,
      rooms: [
        {
          prefix: "N",
          from: 146,
          to: 153
        },
        {
          prefix: "N",
          from: 246,
          to: 253
        }
      ],
      node: "AB"
    },
    {
      id: "nw5",
      group: "ノースウイング",
      label: "N154-162",
      rect: {
        x: 1504,
        y: 351,
        w: 90,
        h: 40,
        r: 3
      },
      cx: 1549,
      cy: 370,
      rooms: [
        {
          prefix: "N",
          from: 154,
          to: 162
        },
        {
          prefix: "N",
          from: 254,
          to: 262
        }
      ],
      node: "AC"
    },
    {
      id: "gt",
      group: "ガーデンテラス",
      label: "T101-316",
      rect: {
        x: 996,
        y: 335,
        w: 81,
        h: 98,
        r: 3
      },
      cx: 1036,
      cy: 384,
      rooms: [
        {
          prefix: "T",
          from: 101,
          to: 316
        }
      ],
      node: "AR"
    },
    {
      id: "gv131",
      group: "ガーデンヴィラズ",
      label: "V131-132",
      rect: {
        x: 309,
        y: 417,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 319,
      cy: 427,
      rooms: [
        {
          prefix: "V",
          from: 131,
          to: 132
        }
      ],
      node: "D"
    },
    {
      id: "gv128",
      group: "ガーデンヴィラズ",
      label: "V128-130",
      rect: {
        x: 341,
        y: 420,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 353,
      cy: 431,
      rooms: [
        {
          prefix: "V",
          from: 128,
          to: 130
        }
      ],
      node: "AH"
    },
    {
      id: "gv125",
      group: "ガーデンヴィラズ",
      label: "V125-127",
      rect: {
        x: 370,
        y: 418,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 382,
      cy: 430,
      rooms: [
        {
          prefix: "V",
          from: 125,
          to: 127
        }
      ],
      node: "AH"
    },
    {
      id: "gv123",
      group: "ガーデンヴィラズ",
      label: "V123-124",
      rect: {
        x: 422,
        y: 437,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 432,
      cy: 447,
      rooms: [
        {
          prefix: "V",
          from: 123,
          to: 124
        }
      ],
      node: "AH"
    },
    {
      id: "gv141",
      group: "ガーデンヴィラズ",
      label: "V141-142",
      rect: {
        x: 443,
        y: 332,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 453,
      cy: 341,
      rooms: [
        {
          prefix: "V",
          from: 141,
          to: 142
        }
      ],
      node: "AI"
    },
    {
      id: "gv139",
      group: "ガーデンヴィラズ",
      label: "V139-140",
      rect: {
        x: 440,
        y: 359,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 450,
      cy: 369,
      rooms: [
        {
          prefix: "V",
          from: 139,
          to: 140
        }
      ],
      node: "AI"
    },
    {
      id: "gv137",
      group: "ガーデンヴィラズ",
      label: "V137-138",
      rect: {
        x: 474,
        y: 359,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 484,
      cy: 369,
      rooms: [
        {
          prefix: "V",
          from: 137,
          to: 138
        }
      ],
      node: "AI"
    },
    {
      id: "gv135",
      group: "ガーデンヴィラズ",
      label: "V135-136",
      rect: {
        x: 439,
        y: 386,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 449,
      cy: 396,
      rooms: [
        {
          prefix: "V",
          from: 135,
          to: 136
        }
      ],
      node: "AH"
    },
    {
      id: "gv133",
      group: "ガーデンヴィラズ",
      label: "V133-134",
      rect: {
        x: 442,
        y: 411,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 452,
      cy: 421,
      rooms: [
        {
          prefix: "V",
          from: 133,
          to: 134
        }
      ],
      node: "AH"
    },
    {
      id: "gv143",
      group: "ガーデンヴィラズ",
      label: "V143",
      rect: {
        x: 458,
        y: 291,
        w: 15,
        h: 15,
        r: 3
      },
      cx: 466,
      cy: 299,
      rooms: [
        {
          prefix: "V",
          from: 143,
          to: 143
        }
      ],
      node: "F"
    },
    {
      id: "gv144",
      group: "ガーデンヴィラズ",
      label: "V144-145",
      rect: {
        x: 480,
        y: 287,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 490,
      cy: 297,
      rooms: [
        {
          prefix: "V",
          from: 144,
          to: 145
        }
      ],
      node: "G"
    },
    {
      id: "gv148",
      group: "ガーデンヴィラズ",
      label: "V148-149",
      rect: {
        x: 508,
        y: 287,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 517,
      cy: 297,
      rooms: [
        {
          prefix: "V",
          from: 148,
          to: 149
        }
      ],
      node: "G"
    },
    {
      id: "gv152",
      group: "ガーデンヴィラズ",
      label: "V152-153",
      rect: {
        x: 533,
        y: 287,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 543,
      cy: 297,
      rooms: [
        {
          prefix: "V",
          from: 152,
          to: 153
        }
      ],
      node: "G"
    },
    {
      id: "gv154",
      group: "ガーデンヴィラズ",
      label: "V154-155",
      rect: {
        x: 563,
        y: 287,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 572,
      cy: 297,
      rooms: [
        {
          prefix: "V",
          from: 154,
          to: 155
        }
      ],
      node: "H"
    },
    {
      id: "gv156",
      group: "ガーデンヴィラズ",
      label: "V156-157",
      rect: {
        x: 590,
        y: 287,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 600,
      cy: 297,
      rooms: [
        {
          prefix: "V",
          from: 156,
          to: 157
        }
      ],
      node: "H"
    },
    {
      id: "gv146",
      group: "ガーデンヴィラズ",
      label: "V146-147",
      rect: {
        x: 491,
        y: 329,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 501,
      cy: 338,
      rooms: [
        {
          prefix: "V",
          from: 146,
          to: 147
        }
      ],
      node: "G"
    },
    {
      id: "gv150",
      group: "ガーデンヴィラズ",
      label: "V150-151",
      rect: {
        x: 518,
        y: 329,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 528,
      cy: 338,
      rooms: [
        {
          prefix: "V",
          from: 150,
          to: 151
        }
      ],
      node: "G"
    },
    {
      id: "gv118",
      group: "ガーデンヴィラズ",
      label: "V118-119",
      rect: {
        x: 482,
        y: 403,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 492,
      cy: 413,
      rooms: [
        {
          prefix: "V",
          from: 118,
          to: 119
        }
      ],
      node: "AH"
    },
    {
      id: "gv113",
      group: "ガーデンヴィラズ",
      label: "V113-114",
      rect: {
        x: 508,
        y: 399,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 517,
      cy: 409,
      rooms: [
        {
          prefix: "V",
          from: 113,
          to: 114
        }
      ],
      node: "AJ"
    },
    {
      id: "gv120",
      group: "ガーデンヴィラズ",
      label: "V120-122",
      rect: {
        x: 462,
        y: 431,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 473,
      cy: 442,
      rooms: [
        {
          prefix: "V",
          from: 120,
          to: 122
        }
      ],
      node: "AG"
    },
    {
      id: "gv115",
      group: "ガーデンヴィラズ",
      label: "V115-117",
      rect: {
        x: 492,
        y: 431,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 504,
      cy: 442,
      rooms: [
        {
          prefix: "V",
          from: 115,
          to: 117
        }
      ],
      node: "AG"
    },
    {
      id: "gv110",
      group: "ガーデンヴィラズ",
      label: "V110-112",
      rect: {
        x: 523,
        y: 431,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 534,
      cy: 442,
      rooms: [
        {
          prefix: "V",
          from: 110,
          to: 112
        }
      ],
      node: "AG"
    },
    {
      id: "gv105",
      group: "ガーデンヴィラズ",
      label: "V105-107",
      rect: {
        x: 553,
        y: 431,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 565,
      cy: 442,
      rooms: [
        {
          prefix: "V",
          from: 105,
          to: 107
        }
      ],
      node: "AK"
    },
    {
      id: "gv248",
      group: "ガーデンヴィラズ",
      label: "V248-249",
      rect: {
        x: 720,
        y: 295,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 730,
      cy: 305,
      rooms: [
        {
          prefix: "V",
          from: 248,
          to: 249
        }
      ],
      node: "J"
    },
    {
      id: "gv246",
      group: "ガーデンヴィラズ",
      label: "V246-247",
      rect: {
        x: 747,
        y: 293,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 757,
      cy: 303,
      rooms: [
        {
          prefix: "V",
          from: 246,
          to: 247
        }
      ],
      node: "M"
    },
    {
      id: "gv242",
      group: "ガーデンヴィラズ",
      label: "V242-243",
      rect: {
        x: 795,
        y: 293,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 804,
      cy: 303,
      rooms: [
        {
          prefix: "V",
          from: 242,
          to: 243
        }
      ],
      node: "M"
    },
    {
      id: "gv238",
      group: "ガーデンヴィラズ",
      label: "V238-239",
      rect: {
        x: 824,
        y: 292,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 833,
      cy: 302,
      rooms: [
        {
          prefix: "V",
          from: 238,
          to: 239
        }
      ],
      node: "N"
    },
    {
      id: "gv234",
      group: "ガーデンヴィラズ",
      label: "V234-235",
      rect: {
        x: 853,
        y: 292,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 862,
      cy: 302,
      rooms: [
        {
          prefix: "V",
          from: 234,
          to: 235
        }
      ],
      node: "N"
    },
    {
      id: "gv230",
      group: "ガーデンヴィラズ",
      label: "V230-231",
      rect: {
        x: 878,
        y: 292,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 888,
      cy: 302,
      rooms: [
        {
          prefix: "V",
          from: 230,
          to: 231
        }
      ],
      node: "N"
    },
    {
      id: "gv228",
      group: "ガーデンヴィラズ",
      label: "V228-229",
      rect: {
        x: 907,
        y: 292,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 917,
      cy: 302,
      rooms: [
        {
          prefix: "V",
          from: 228,
          to: 229
        }
      ],
      node: "O"
    },
    {
      id: "gv313",
      group: "ガーデンヴィラズ",
      label: "V313-315",
      rect: {
        x: 944,
        y: 289,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 956,
      cy: 300,
      rooms: [
        {
          prefix: "V",
          from: 313,
          to: 315
        }
      ],
      node: "O"
    },
    {
      id: "gv316",
      group: "ガーデンヴィラズ",
      label: "V316-318",
      rect: {
        x: 975,
        y: 287,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 986,
      cy: 299,
      rooms: [
        {
          prefix: "V",
          from: 316,
          to: 318
        }
      ],
      node: "P"
    },
    {
      id: "gv244",
      group: "ガーデンヴィラズ",
      label: "V244-245",
      rect: {
        x: 779,
        y: 335,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 789,
      cy: 345,
      rooms: [
        {
          prefix: "V",
          from: 244,
          to: 245
        }
      ],
      node: "M"
    },
    {
      id: "gv240",
      group: "ガーデンヴィラズ",
      label: "V240-241",
      rect: {
        x: 810,
        y: 335,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 820,
      cy: 345,
      rooms: [
        {
          prefix: "V",
          from: 240,
          to: 241
        }
      ],
      node: "N"
    },
    {
      id: "gv236",
      group: "ガーデンヴィラズ",
      label: "V236-237",
      rect: {
        x: 839,
        y: 335,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 849,
      cy: 345,
      rooms: [
        {
          prefix: "V",
          from: 236,
          to: 237
        }
      ],
      node: "N"
    },
    {
      id: "gv232",
      group: "ガーデンヴィラズ",
      label: "V232-233",
      rect: {
        x: 866,
        y: 335,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 876,
      cy: 345,
      rooms: [
        {
          prefix: "V",
          from: 232,
          to: 233
        }
      ],
      node: "N"
    },
    {
      id: "gv226",
      group: "ガーデンヴィラズ",
      label: "V226-227",
      rect: {
        x: 907,
        y: 335,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 917,
      cy: 345,
      rooms: [
        {
          prefix: "V",
          from: 226,
          to: 227
        }
      ],
      node: "O"
    },
    {
      id: "gv224",
      group: "ガーデンヴィラズ",
      label: "V224-225",
      rect: {
        x: 907,
        y: 368,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 917,
      cy: 378,
      rooms: [
        {
          prefix: "V",
          from: 224,
          to: 225
        }
      ],
      node: "AN"
    },
    {
      id: "gv222",
      group: "ガーデンヴィラズ",
      label: "V222-223",
      rect: {
        x: 907,
        y: 402,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 917,
      cy: 412,
      rooms: [
        {
          prefix: "V",
          from: 222,
          to: 223
        }
      ],
      node: "AN"
    },
    {
      id: "gv220",
      group: "ガーデンヴィラズ",
      label: "V220-221",
      rect: {
        x: 907,
        y: 432,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 917,
      cy: 442,
      rooms: [
        {
          prefix: "V",
          from: 220,
          to: 221
        }
      ],
      node: "AO"
    },
    {
      id: "gv218",
      group: "ガーデンヴィラズ",
      label: "V218-219",
      rect: {
        x: 907,
        y: 460,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 917,
      cy: 470,
      rooms: [
        {
          prefix: "V",
          from: 218,
          to: 219
        }
      ],
      node: "AO"
    },
    {
      id: "gv310",
      group: "ガーデンヴィラズ",
      label: "V310-312",
      rect: {
        x: 956,
        y: 336,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 968,
      cy: 348,
      rooms: [
        {
          prefix: "V",
          from: 310,
          to: 312
        }
      ],
      node: "P"
    },
    {
      id: "gv307",
      group: "ガーデンヴィラズ",
      label: "V307-309",
      rect: {
        x: 956,
        y: 377,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 968,
      cy: 389,
      rooms: [
        {
          prefix: "V",
          from: 307,
          to: 309
        }
      ],
      node: "AR"
    },
    {
      id: "gv304",
      group: "ガーデンヴィラズ",
      label: "V304-306",
      rect: {
        x: 956,
        y: 418,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 968,
      cy: 430,
      rooms: [
        {
          prefix: "V",
          from: 304,
          to: 306
        }
      ],
      node: "AR"
    },
    {
      id: "gv301",
      group: "ガーデンヴィラズ",
      label: "V301-303",
      rect: {
        x: 956,
        y: 458,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 968,
      cy: 470,
      rooms: [
        {
          prefix: "V",
          from: 301,
          to: 303
        }
      ],
      node: "AU"
    },
    {
      id: "gv201",
      group: "ガーデンヴィラズ",
      label: "V201-202",
      rect: {
        x: 781,
        y: 411,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 791,
      cy: 421,
      rooms: [
        {
          prefix: "V",
          from: 201,
          to: 202
        }
      ],
      node: "AL"
    },
    {
      id: "gv206",
      group: "ガーデンヴィラズ",
      label: "V206-207",
      rect: {
        x: 808,
        y: 411,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 818,
      cy: 421,
      rooms: [
        {
          prefix: "V",
          from: 206,
          to: 207
        }
      ],
      node: "AM"
    },
    {
      id: "gv211",
      group: "ガーデンヴィラズ",
      label: "V211-212",
      rect: {
        x: 839,
        y: 411,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 849,
      cy: 421,
      rooms: [
        {
          prefix: "V",
          from: 211,
          to: 212
        }
      ],
      node: "AM"
    },
    {
      id: "gv216",
      group: "ガーデンヴィラズ",
      label: "V216-217",
      rect: {
        x: 866,
        y: 411,
        w: 20,
        h: 20,
        r: 3
      },
      cx: 876,
      cy: 421,
      rooms: [
        {
          prefix: "V",
          from: 216,
          to: 217
        }
      ],
      node: "AM"
    },
    {
      id: "gv203",
      group: "ガーデンヴィラズ",
      label: "V203-205",
      rect: {
        x: 796,
        y: 440,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 807,
      cy: 451,
      rooms: [
        {
          prefix: "V",
          from: 203,
          to: 205
        }
      ],
      node: "AQ"
    },
    {
      id: "gv208",
      group: "ガーデンヴィラズ",
      label: "V208-210",
      rect: {
        x: 828,
        y: 440,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 840,
      cy: 451,
      rooms: [
        {
          prefix: "V",
          from: 208,
          to: 210
        }
      ],
      node: "AP"
    },
    {
      id: "gv213",
      group: "ガーデンヴィラズ",
      label: "V213-215",
      rect: {
        x: 859,
        y: 440,
        w: 23,
        h: 23,
        r: 3
      },
      cx: 870,
      cy: 451,
      rooms: [
        {
          prefix: "V",
          from: 213,
          to: 215
        }
      ],
      node: "AP"
    },
    {
      id: "gv321",
      group: "ガーデンヴィラズ",
      label: "V321-324",
      rect: {
        x: 1097,
        y: 335,
        w: 23,
        h: 34,
        r: 3
      },
      cx: 1108,
      cy: 352,
      rooms: [
        {
          prefix: "V",
          from: 321,
          to: 324
        }
      ],
      node: "AS"
    },
    {
      id: "gv325",
      group: "ガーデンヴィラズ",
      label: "V325-328",
      rect: {
        x: 1097,
        y: 383,
        w: 23,
        h: 34,
        r: 3
      },
      cx: 1108,
      cy: 399,
      rooms: [
        {
          prefix: "V",
          from: 325,
          to: 328
        }
      ],
      node: "AS"
    },
    {
      id: "gv329",
      group: "ガーデンヴィラズ",
      label: "V329-332",
      rect: {
        x: 1085,
        y: 428,
        w: 23,
        h: 34,
        r: 3
      },
      cx: 1096,
      cy: 445,
      rooms: [
        {
          prefix: "V",
          from: 329,
          to: 332
        }
      ],
      node: "AT"
    },
    {
      id: "gv333",
      group: "ガーデンヴィラズ",
      label: "V333-336",
      rect: {
        x: 1048,
        y: 434,
        w: 23,
        h: 34,
        r: 3
      },
      cx: 1059,
      cy: 451,
      rooms: [
        {
          prefix: "V",
          from: 333,
          to: 336
        }
      ],
      node: "AT"
    },
    {
      id: "gv337",
      group: "ガーデンヴィラズ",
      label: "V337-340",
      rect: {
        x: 1010,
        y: 434,
        w: 23,
        h: 34,
        r: 3
      },
      cx: 1021,
      cy: 451,
      rooms: [
        {
          prefix: "V",
          from: 337,
          to: 340
        }
      ],
      node: "AU"
    },
    {
      id: "hanare",
      group: null,
      label: "HANARÉ",
      rect: {
        x: 612,
        y: 277,
        w: 58,
        h: 34,
        r: 3
      },
      cx: 641,
      cy: 294,
      rooms: [],
      node: "I"
    },
    {
      id: "shintenchi",
      group: null,
      label: "琉球新天地",
      rect: {
        x: 553,
        y: 332,
        w: 55,
        h: 67,
        r: 3
      },
      cx: 580,
      cy: 366,
      rooms: [],
      node: "AJ"
    },
    {
      id: "wellness",
      group: null,
      label: "ウェルネスセンター",
      rect: {
        x: 672,
        y: 332,
        w: 96,
        h: 159,
        r: 3
      },
      cx: 720,
      cy: 412,
      rooms: [],
      node: "AL"
    },
    {
      id: "central",
      group: null,
      label: "セントラルヴィレッジ",
      rect: {
        x: 1168,
        y: 312,
        w: 137,
        h: 127,
        r: 3
      },
      cx: 1236,
      cy: 375,
      rooms: [],
      node: "S"
    },
    {
      id: "bold",
      group: null,
      label: "BOLD KITCHEN棟",
      rect: {
        x: 1305,
        y: 317,
        w: 64,
        h: 76,
        r: 3
      },
      cx: 1337,
      cy: 355,
      rooms: [],
      node: "V"
    },
    {
      id: "kachibai",
      group: null,
      label: "夏至南風",
      rect: {
        x: 832,
        y: 183,
        w: 32,
        h: 61,
        r: 3
      },
      cx: 848,
      cy: 213,
      rooms: [],
      node: "AW"
    },
    {
      id: "starbar",
      group: null,
      label: "THE STAR BAR",
      rect: {
        x: 1122,
        y: 218,
        w: 29,
        h: 26,
        r: 3
      },
      cx: 1136,
      cy: 231,
      rooms: [],
      node: "AZ"
    },
    {
      id: "bstation",
      group: null,
      label: "ビーチステーション",
      rect: {
        x: 1159,
        y: 195,
        w: 29,
        h: 64,
        r: 3
      },
      cx: 1173,
      cy: 227,
      rooms: [],
      node: "AZ"
    },
    {
      id: "ayapani",
      group: null,
      label: "AYAPANI",
      rect: {
        x: 928,
        y: 256,
        w: 27,
        h: 21,
        r: 3
      },
      cx: 942,
      cy: 267,
      rooms: [],
      node: "AX"
    },
    {
      id: "agcafe",
      group: null,
      label: "アクアガーデンカフェ",
      rect: {
        x: 1032,
        y: 277,
        w: 46,
        h: 30,
        r: 3
      },
      cx: 1055,
      cy: 293,
      rooms: [],
      node: "Q"
    },
    {
      id: "animal",
      group: null,
      label: "アニマルスクエア",
      rect: {
        x: 43,
        y: 290,
        w: 24,
        h: 24,
        r: 3
      },
      cx: 55,
      cy: 302,
      rooms: [],
      node: "A"
    }
  ],
  nodes: [
    {
      id: "A",
      x: 55,
      y: 313
    },
    {
      id: "B",
      x: 150,
      y: 328
    },
    {
      id: "C",
      x: 218,
      y: 328
    },
    {
      id: "D",
      x: 287,
      y: 328
    },
    {
      id: "E",
      x: 386,
      y: 325
    },
    {
      id: "F",
      x: 458,
      y: 316
    },
    {
      id: "G",
      x: 519,
      y: 316
    },
    {
      id: "H",
      x: 580,
      y: 316
    },
    {
      id: "I",
      x: 641,
      y: 316
    },
    {
      id: "J",
      x: 682,
      y: 316
    },
    {
      id: "K",
      x: 682,
      y: 152
    },
    {
      id: "L",
      x: 682,
      y: 84
    },
    {
      id: "M",
      x: 778,
      y: 316
    },
    {
      id: "N",
      x: 855,
      y: 316
    },
    {
      id: "O",
      x: 931,
      y: 316
    },
    {
      id: "P",
      x: 992,
      y: 316
    },
    {
      id: "Q",
      x: 1069,
      y: 313
    },
    {
      id: "R",
      x: 1175,
      y: 335
    },
    {
      id: "S",
      x: 1221,
      y: 358
    },
    {
      id: "T",
      x: 1252,
      y: 399
    },
    {
      id: "U",
      x: 1313,
      y: 442
    },
    {
      id: "V",
      x: 1359,
      y: 366
    },
    {
      id: "W",
      x: 1420,
      y: 328
    },
    {
      id: "X",
      x: 1526,
      y: 313
    },
    {
      id: "Y",
      x: 1633,
      y: 300
    },
    {
      id: "Z",
      x: 1710,
      y: 290
    },
    {
      id: "AA",
      x: 1755,
      y: 198
    },
    {
      id: "AB",
      x: 1420,
      y: 404
    },
    {
      id: "AC",
      x: 1542,
      y: 393
    },
    {
      id: "AD",
      x: 641,
      y: 381
    },
    {
      id: "AF",
      x: 638,
      y: 463
    },
    {
      id: "AG",
      x: 504,
      y: 457
    },
    {
      id: "AH",
      x: 458,
      y: 412
    },
    {
      id: "AI",
      x: 458,
      y: 358
    },
    {
      id: "AJ",
      x: 550,
      y: 389
    },
    {
      id: "AK",
      x: 565,
      y: 457
    },
    {
      id: "AL",
      x: 778,
      y: 396
    },
    {
      id: "AM",
      x: 855,
      y: 396
    },
    {
      id: "AN",
      x: 931,
      y: 396
    },
    {
      id: "AO",
      x: 931,
      y: 473
    },
    {
      id: "AP",
      x: 855,
      y: 473
    },
    {
      id: "AQ",
      x: 778,
      y: 473
    },
    {
      id: "AR",
      x: 1000,
      y: 396
    },
    {
      id: "AS",
      x: 1084,
      y: 396
    },
    {
      id: "AT",
      x: 1084,
      y: 473
    },
    {
      id: "AU",
      x: 1000,
      y: 473
    },
    {
      id: "AV",
      x: 717,
      y: 473
    },
    {
      id: "AW",
      x: 849,
      y: 259
    },
    {
      id: "AX",
      x: 931,
      y: 259
    },
    {
      id: "AY",
      x: 1007,
      y: 259
    },
    {
      id: "AZ",
      x: 1137,
      y: 259
    },
    {
      id: "BA",
      x: 1175,
      y: 282
    },
    {
      id: "BC",
      x: 824,
      y: 168
    },
    {
      id: "BD",
      x: 1279,
      y: 454
    },
    {
      id: "BE",
      x: 1381,
      y: 511
    },
    {
      id: "BF",
      x: 1206,
      y: 457
    }
  ],
  edges: [
    [
      "A",
      "B"
    ],
    [
      "B",
      "C"
    ],
    [
      "C",
      "D"
    ],
    [
      "D",
      "E"
    ],
    [
      "E",
      "F"
    ],
    [
      "F",
      "G"
    ],
    [
      "G",
      "H"
    ],
    [
      "H",
      "I"
    ],
    [
      "I",
      "J"
    ],
    [
      "J",
      "M"
    ],
    [
      "M",
      "N"
    ],
    [
      "N",
      "O"
    ],
    [
      "O",
      "P"
    ],
    [
      "P",
      "Q"
    ],
    [
      "Q",
      "R"
    ],
    [
      "R",
      "S"
    ],
    [
      "S",
      "T"
    ],
    [
      "T",
      "U"
    ],
    [
      "S",
      "V"
    ],
    [
      "V",
      "W"
    ],
    [
      "W",
      "X"
    ],
    [
      "X",
      "Y"
    ],
    [
      "Y",
      "Z"
    ],
    [
      "Z",
      "AA"
    ],
    [
      "W",
      "AB"
    ],
    [
      "AB",
      "AC"
    ],
    [
      "AC",
      "X"
    ],
    [
      "J",
      "K"
    ],
    [
      "K",
      "L"
    ],
    [
      "K",
      "BC"
    ],
    [
      "BC",
      "AW"
    ],
    [
      "N",
      "AW"
    ],
    [
      "AW",
      "AX"
    ],
    [
      "AX",
      "AY"
    ],
    [
      "AY",
      "AZ"
    ],
    [
      "AZ",
      "BA"
    ],
    [
      "BA",
      "R"
    ],
    [
      "I",
      "AD"
    ],
    [
      "AD",
      "AF"
    ],
    [
      "F",
      "AI"
    ],
    [
      "AI",
      "AH"
    ],
    [
      "AH",
      "AG"
    ],
    [
      "AG",
      "AK"
    ],
    [
      "AK",
      "AF"
    ],
    [
      "H",
      "AJ"
    ],
    [
      "AJ",
      "AK"
    ],
    [
      "M",
      "AL"
    ],
    [
      "AL",
      "AM"
    ],
    [
      "AM",
      "AN"
    ],
    [
      "AN",
      "AR"
    ],
    [
      "AR",
      "AS"
    ],
    [
      "N",
      "AM"
    ],
    [
      "O",
      "AN"
    ],
    [
      "P",
      "AR"
    ],
    [
      "AL",
      "AQ"
    ],
    [
      "AM",
      "AP"
    ],
    [
      "AN",
      "AO"
    ],
    [
      "AR",
      "AU"
    ],
    [
      "AS",
      "AT"
    ],
    [
      "AF",
      "AV"
    ],
    [
      "AV",
      "AQ"
    ],
    [
      "AQ",
      "AP"
    ],
    [
      "AP",
      "AO"
    ],
    [
      "AO",
      "AU"
    ],
    [
      "AU",
      "AT"
    ],
    [
      "AT",
      "BF"
    ],
    [
      "BF",
      "BD"
    ],
    [
      "BD",
      "U"
    ],
    [
      "BD",
      "BE"
    ],
    [
      "U",
      "V"
    ]
  ],
  pins: [
    {
      cat: "dining",
      name: "ISHIGAKI BOLD KITCHEN",
      short: "BOLD KITCHEN",
      icon: "🍽",
      x: 1351,
      y: 354,
      rank: 1,
      node: "V"
    },
    {
      cat: "pool_beach",
      name: "フサキビーチ",
      short: "フサキビーチ",
      icon: "🏖",
      x: 733,
      y: 149,
      rank: 1,
      node: "K"
    },
    {
      cat: "pool_beach",
      name: "スプラッシュパーク",
      short: "スプラッシュ",
      icon: "💦",
      x: 931,
      y: 210,
      rank: 1,
      node: "AX"
    },
    {
      cat: null,
      name: "フロント/ロビー(レセプション)",
      short: "フロント",
      icon: "🛎",
      x: 1214,
      y: 389,
      rank: 1,
      node: "S"
    },
    {
      cat: null,
      name: "フサキエンジェルピア(桟橋)",
      short: "桟橋",
      icon: "🌅",
      x: 682,
      y: 91,
      rank: 1,
      node: "L"
    },
    {
      cat: "facilities",
      name: "大浴場",
      short: "大浴場",
      icon: "♨️",
      x: 754,
      y: 387,
      rank: 1,
      node: "AL"
    },
    {
      cat: "dining",
      name: "琉球新天地",
      short: "琉球新天地",
      icon: "🥢",
      x: 577,
      y: 366,
      rank: 2,
      node: "AJ"
    },
    {
      cat: "dining",
      name: "BEACHSIDE GRILL 夏至南風(かちばい)",
      short: "夏至南風",
      icon: "🔥",
      x: 849,
      y: 210,
      rank: 2,
      node: "AW"
    },
    {
      cat: "dining",
      name: "HANARÉ(はなれ)",
      short: "HANARÉ",
      icon: "🍷",
      x: 641,
      y: 290,
      rank: 2,
      node: "I"
    },
    {
      cat: "dining",
      name: "THE STAR BAR",
      short: "STAR BAR",
      icon: "🍸",
      x: 1133,
      y: 232,
      rank: 2,
      node: "AZ"
    },
    {
      cat: "pool_beach",
      name: "ビーチサイドプール(アクアガーデン)",
      short: "ビーチプール",
      icon: "🏊",
      x: 1020,
      y: 226,
      rank: 2,
      node: "AY"
    },
    {
      cat: "pool_beach",
      name: "ビーチステーション",
      short: "ビーチステーション",
      icon: "🏄",
      x: 1178,
      y: 226,
      rank: 2,
      node: "AZ"
    },
    {
      cat: "pool_beach",
      name: "インドアプール",
      short: "インドアプール",
      icon: "🏊",
      x: 730,
      y: 424,
      rank: 2,
      node: "AV"
    },
    {
      cat: "activities",
      name: "グラスボート遊覧(フサキクルーズ)",
      short: "グラスボート",
      icon: "⛵",
      x: 690,
      y: 165,
      rank: 2,
      node: "K"
    },
    {
      cat: "facilities",
      name: "RESORT SHOP & MARKET",
      short: "ショップ",
      icon: "🛍",
      x: 1325,
      y: 320,
      rank: 2,
      node: "V"
    },
    {
      cat: "access",
      name: "無料シャトルバス(南ぬ島石垣空港 ⇔ ホテル)",
      short: "送迎バス",
      icon: "🚌",
      x: 1301,
      y: 415,
      rank: 2,
      node: "U"
    },
    {
      cat: null,
      name: "P2駐車場",
      short: "P2",
      icon: "🅿️",
      x: 1339,
      y: 439,
      rank: 2,
      node: "U"
    },
    {
      cat: null,
      name: "P1駐車場",
      short: "P1",
      icon: "🅿️",
      x: 626,
      y: 485,
      rank: 2,
      node: "AF"
    },
    {
      cat: "dining",
      name: "Lounge bar ADAN",
      short: "ADAN",
      icon: "🍹",
      x: 1218,
      y: 348,
      rank: 3,
      node: "S"
    },
    {
      cat: "dining",
      name: "Aqua Garden Cafe",
      short: "カフェ",
      icon: "🍔",
      x: 1053,
      y: 290,
      rank: 3,
      node: "Q"
    },
    {
      cat: "pool_beach",
      name: "ナイトプール(20歳以上限定)",
      short: "ナイトプール",
      icon: "🌙",
      x: 1072,
      y: 226,
      rank: 3,
      node: "AY"
    },
    {
      cat: "pool_beach",
      name: "キッズプール",
      short: "キッズ",
      icon: "🧒",
      x: 968,
      y: 238,
      rank: 3,
      node: "AX"
    },
    {
      cat: "activities",
      name: "ツアーデスク",
      short: "ツアーデスク",
      icon: "🗺",
      x: 1255,
      y: 375,
      rank: 3,
      node: "T"
    },
    {
      cat: "activities",
      name: "AYAPANI キッズプログラム(工作・ものづくり体験)",
      short: "キッズ体験",
      icon: "🎨",
      x: 901,
      y: 244,
      rank: 3,
      node: "AX"
    },
    {
      cat: "facilities",
      name: "ベビー&キッズルーム「AYAPANI」",
      short: "AYAPANI",
      icon: "🧸",
      x: 943,
      y: 277,
      rank: 3,
      node: "AX"
    },
    {
      cat: "facilities",
      name: "FUSAKI SPA",
      short: "スパ",
      icon: "💆",
      x: 711,
      y: 363,
      rank: 3,
      node: "J"
    },
    {
      cat: "facilities",
      name: "TERRACE SHOP",
      short: "テラスショップ",
      icon: "🏪",
      x: 763,
      y: 335,
      rank: 3,
      node: "M"
    },
    {
      cat: "facilities",
      name: "アニマルスクエア",
      short: "アニマルスクエア",
      icon: "🐐",
      x: 55,
      y: 299,
      rank: 3,
      node: "A"
    },
    {
      cat: null,
      name: "フィットネスジム",
      short: "ジム",
      icon: "🏋",
      x: 690,
      y: 399,
      rank: 3,
      node: "AD"
    },
    {
      cat: null,
      name: "エントランス/車寄せ",
      short: "エントランス",
      icon: "🚪",
      x: 1279,
      y: 451,
      rank: 3,
      node: "BD"
    },
    {
      cat: null,
      name: "火番盛(HIBANMUI)展望台",
      short: "火番盛",
      icon: "🔭",
      x: 1755,
      y: 183,
      rank: 3,
      node: "AA"
    }
  ]
};
