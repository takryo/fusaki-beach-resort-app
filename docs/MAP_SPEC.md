# 館内マップ 仕様(データスキーマ)

## 方針
- 公式マップ画像は同梱しない(著作権)。配置を参考にしたオリジナルの模式図SVGを描く
- データは `data/resort-map.js` に `window.RESORT_MAP = {...}` として定義
- 座標系: viewBox 0 0 1000 700(横長)。海(フサキビーチ)は左〜下側に配置

## スキーマ
```js
window.RESORT_MAP = {
  updatedAt: "2026-09-14",
  officialMapUrl: "https://...",   // 公式マップ(PDF/ページ)へのリンク
  // 背景の面(海・ビーチ・緑地・建物ブロック・道路)。描画順に並べる
  areas: [
    {
      id: "sea",
      kind: "sea" | "beach" | "green" | "building" | "pool" | "road" | "path",
      label: "フサキビーチ" | null,      // 面に直接書くラベル(任意)
      labelPos: { x: 120, y: 600 },      // ラベル位置(任意)
      // 多角形 or 矩形のどちらか
      points: "x1,y1 x2,y2 ..." | null,  // SVG polygon points
      rect: { x, y, w, h, r } | null     // 角丸矩形
    }
  ],
  // タップ可能な施設ピン。cat+name は data/resort-data.js の項目に一致させる
  pins: [
    {
      cat: "dining",              // resort-data.js のカテゴリid
      name: "ISHIGAKI BOLD KITCHEN",  // resort-data.js の項目名と完全一致
      short: "BOLD KITCHEN",      // マップ上の短い表示名
      icon: "🍽",
      x: 500, y: 300
    },
    // resort-data に対応項目がない場所(フロント、駐車場等)は cat: null で
    { cat: null, name: "フロント/ロビー", short: "フロント", icon: "🛎", x: 520, y: 280 }
  ]
};
```

## 品質基準
- 位置は公式マップに照らして「相対関係が正しい」こと(建物の並び・ビーチとの位置関係・
  ヴィレッジ/ヴィラエリアの区別)。縮尺の厳密さは不要
- ピンは重なって読めなくならないよう最低40px(座標単位)離す
- 全ピンの cat+name が resort-data.js と一致することを検証すること
