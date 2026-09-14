/**
 * フサキビーチリゾート ホテル&ヴィラズ 滞在情報データ
 * 出典: 公式サイト (fusaki.com) ほか。2026年9月14日時点でウェブから確認できた情報。
 * 料金・時刻は変更される場合があるため「目安」として扱い、確定情報は公式サイト/フロントで確認すること。
 */
window.RESORT_DATA = {
  updatedAt: "2026-09-14",

  hotel: {
    name: "フサキビーチリゾート ホテル&ヴィラズ",
    address: "〒907-0024 沖縄県石垣市新川1625",
    tel: "0980-88-7000",
    checkIn: "15:00",
    checkOut: "11:00",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%95%E3%82%B5%E3%82%AD%E3%83%93%E3%83%BC%E3%83%81%E3%83%AA%E3%82%BE%E3%83%BC%E3%83%88%E3%83%9B%E3%83%86%E3%83%AB%26%E3%83%B4%E3%82%A3%E3%83%A9%E3%82%BA",
    notes: [
      "南ぬ島石垣空港から車で約35分、石垣港離島ターミナルから車で約15分。",
      "レストラン専用予約番号 0980-88-7095（受付 9:00〜20:00）。スパ直通 0980-88-7098。",
      "宿泊者は館内のプール・ビーチ・大浴場を無料で利用可能。",
      "敷地が広くヴィラ棟までは徒歩数分。館内の移動用にサンダルとライトがあると便利。",
      "9月はまだ台風シーズン。屋外施設やクルーズは天候で中止になることがある。"
    ]
  },

  categories: [
    {
      id: "dining",
      title: "レストラン&バー",
      icon: "🍽",
      items: [
        {
          name: "ISHIGAKI BOLD KITCHEN",
          description: "世界の料理が80品以上並ぶ島内最大級のオールデイダイニング。朝食ブッフェの会場にもなるメインレストラン。",
          hours: "朝食 6:30〜10:30(最終入店9:30) / ランチ 12:00〜15:00(90分制・季節営業) / ディナー 17:30〜21:30(最終入店19:30)",
          location: "セントラルヴィレッジ",
          tel: "0980-88-7095",
          url: "https://ishigaki-bold-kitchen.com/",
          mapUrl: null,
          tips: "予約推奨(TableCheckまたは電話)。料金目安は朝食・ランチ 大人3,800円、ディナー 大人6,500円(税サ込)。ランチは季節営業のため実施日を要確認。"
        },
        {
          name: "琉球新天地",
          description: "琉球料理のルーツである中国・東南アジア・九州・沖縄の食文化を融合させたフュージョンレストラン。夕食コースのほかテイクアウトも。",
          hours: "朝食 6:30〜10:30(最終入店9:30) / ディナー 17:30〜21:30(L.O.21:00) / テイクアウト 17:00〜21:30",
          location: "エイトスターズヴィレッジ",
          tel: "0980-88-7095",
          url: "https://ryukyu-shintennchi.com",
          mapUrl: null,
          tips: "ディナーは予約推奨。ディナー単品は1,200〜2,500円程度、コースは3,000円〜が目安。貸切営業で休みになる日があるため公式サイトの休業案内を要確認。"
        },
        {
          name: "HANARÉ(はなれ)",
          description: "石垣牛・石垣黒鶏・島の魚介を使うシェフおまかせフルコースのファインダイニング。ソムリエセレクトのドリンクと合わせる大人向けの一軒。",
          hours: "ディナー 17:00〜22:00(最終入店19:30) ※要確認",
          location: "リゾート内(エイトスターズヴィレッジ側)",
          tel: "0980-88-7095",
          url: "https://hanare-ryukyu-shintenchi.com/",
          mapUrl: null,
          tips: "完全予約制。料金目安15,000円〜。ドレスコードはリゾートカジュアル(タンクトップ・スポーツウェア・ビーチサンダル不可)。記念日利用におすすめ。"
        },
        {
          name: "BEACHSIDE GRILL 夏至南風(かちばい)",
          description: "全席アウトドアの東シナ海を望むビーチサイドBBQ。サンセットを眺めながらのグリルコースが名物。",
          hours: "ランチ 11:00〜14:30(L.O.14:00 ※7〜9月限定) / ディナー 17:00〜21:30(90分制)",
          location: "アクアガーデン近くのビーチサイド",
          tel: "0980-88-7095",
          url: "https://beachside-grill-kachibai.com/",
          mapUrl: null,
          tips: "要予約。営業期間は3月20日〜10月31日で9月中旬は営業中(ランチも7〜9月限定で実施)。雨天・強風時はクローズ。ディナー6,800円〜が目安。"
        },
        {
          name: "THE STAR BAR",
          description: "ライトアップされたプールと海を望むビーチフロントのバー。トロピカルカクテルやモヒートが充実。",
          hours: "10:00〜23:00(L.O.22:30)",
          location: "アクアガーデン(ビーチサイドプール脇)",
          tel: "0980-88-7095",
          url: "https://www.fusaki.com/restaurant/starbar",
          mapUrl: null,
          tips: "予約不要。屋外のため荒天時はクローズし Lounge bar ADAN で営業。サンセットの時間帯は混みやすい。"
        },
        {
          name: "Lounge bar ADAN",
          description: "八重山のアイスやコーヒー、島フルーツのジュースを楽しめる屋内ラウンジバー。雨の日の避難先にもなる。",
          hours: "10:00〜17:00 ※夜間営業日あり。公式サイトで要確認",
          location: "セントラルヴィレッジ",
          tel: "0980-88-7095",
          url: "https://www.fusaki.com/restaurant/adan",
          mapUrl: null,
          tips: "予約不要。1,500円〜が目安。THE STAR BAR が荒天クローズの際はこちらで営業。"
        },
        {
          name: "Aqua Garden Cafe",
          description: "ボリュームのあるグルメバーガーが看板のカジュアルカフェ。テイクアウトしてプールサイドやビーチで食べられる。",
          hours: "11:00〜18:00(L.O.17:30)",
          location: "屋外プールエリア「アクアガーデン」内",
          tel: "0980-88-7095",
          url: "https://www.fusaki.com/restaurant/aqua-garden-cafe",
          mapUrl: null,
          tips: "予約不要。1,500円〜が目安。プールで泳ぐ日のランチに便利。"
        }
      ]
    },

    {
      id: "pool_beach",
      title: "プール&ビーチ",
      icon: "🏊",
      items: [
        {
          name: "フサキビーチ",
          description: "ホテル前に広がる天然ビーチ。桟橋から眺めるサンセットが名物で、遊泳エリアはハブクラゲ防止ネットで囲われている。",
          hours: "夏季(3/1〜10/31) 9:00〜17:30 ※6〜9月は18:30まで延長 / 冬季(11〜2月) 9:00〜17:00",
          location: "ホテル正面",
          tel: null,
          url: "https://www.fusaki.com/facility/beach",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%95%E3%82%B5%E3%82%AD%E3%83%93%E3%83%BC%E3%83%81",
          tips: "9月中旬は18:30まで遊泳可(目安)。干潮でサンゴが露出し危険なため、潮位により一部アクティビティが中止になる。桟橋のサンセットは日没20〜30分前から。"
        },
        {
          name: "スプラッシュパーク",
          description: "スライダーやウォーターアトラクションを備えた屋外のアクティブ系プールエリア。",
          hours: "9:00〜18:00(7〜8月は19:00まで)",
          location: "アクアガーデン内",
          tel: null,
          url: "https://www.fusaki.com/facility/aquagarden/splash",
          mapUrl: null,
          tips: "営業期間は2026年3月1日〜11月15日。9月中旬は営業中(9:00〜18:00)。宿泊者は無料。"
        },
        {
          name: "ビーチサイドプール(アクアガーデン)",
          description: "フサキビーチに沿って3層に配された紺碧色の屋外プール。リゾートのメインプール。",
          hours: "3/1〜11/15は9:00〜20:00 / 11/16〜2月末は9:00〜18:00",
          location: "アクアガーデン",
          tel: null,
          url: "https://www.fusaki.com/facility/aquagarden/pool",
          mapUrl: null,
          tips: "9月中旬は20:00まで営業(目安)。宿泊者は無料。夕方以降は空きやすい。"
        },
        {
          name: "ナイトプール(20歳以上限定)",
          description: "夜のビーチサイドプールを大人だけで楽しめる時間帯。ライトアップされた水面とバーの組み合わせが良い。",
          hours: "20:00〜23:00",
          location: "ビーチサイドプール(アクアガーデン)",
          tel: null,
          url: "https://www.fusaki.com/facility/aquagarden/pool",
          mapUrl: null,
          tips: "2026年4月29日〜10月31日の期間限定。20歳以上のみ利用可。9月中旬は営業中。大人旅ならここが狙い目。"
        },
        {
          name: "インドアプール",
          description: "気温・水温とも30℃前後に保たれた通年利用可能な屋内プール。ウォータースライダー付き。",
          hours: "9:00〜21:00(通年)",
          location: "リゾート内 インドアプール棟",
          tel: null,
          url: "https://www.fusaki.com/facility/indoorpool",
          mapUrl: null,
          tips: "宿泊者は無料、浮き輪などのレンタルも無料。雨天・台風時の代替プランとして便利。刺青の露出は不可。"
        },
        {
          name: "ビーチステーション",
          description: "ビーチのマリンメニュー受付・レンタル用品の貸出窓口。",
          hours: "夏季 9:00〜18:30 / 冬季 9:00〜17:00",
          location: "フサキビーチ前",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/facility/aquagarden/information",
          mapUrl: null,
          tips: "当日受付のアクティビティはここで申し込む。潮位が低いと受付を締め切る種目がある。"
        }
      ]
    },

    {
      id: "activities",
      title: "アクティビティ",
      icon: "🤿",
      items: [
        {
          name: "サンセットクルーズ",
          description: "石垣港から出航し、日没前後のマジックアワーを船上から眺める約1時間のクルーズ。ワンドリンク付き。",
          hours: "出航時刻は季節で変動。8〜9月は18:00発(4〜7月18:30、10〜1月17:30)",
          location: "石垣港発(集合場所は予約時に案内)",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/activity/outside/island/6257",
          mapUrl: null,
          tips: "要予約(ツアーデスクまたはメールフォーム)。料金目安 3歳以上おひとり6,600円(税込・船代/1ドリンク/保険込)。大人旅の一番のおすすめ。天候により欠航あり。"
        },
        {
          name: "シュノーケルツアー",
          description: "フサキビーチ沖でガイドと一緒に潜るシュノーケリング。ショート(約1時間)から催行。",
          hours: null,
          location: "フサキビーチ / ビーチステーション集合",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/activity/fusaki/beach-marine/143",
          mapUrl: null,
          tips: "要予約。料金目安 大人7,700円〜。開催時間・催行時刻は公式サイトで要確認。"
        },
        {
          name: "SUP体験ツアー / クリアSUP体験ツアー",
          description: "穏やかなフサキビーチでのスタンドアップパドルボード体験。透明ボードのクリアSUPもある。",
          hours: null,
          location: "フサキビーチ",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/activity/category/fusaki",
          mapUrl: null,
          tips: "要予約。料金目安 大人・子供7,700円〜。冬季(11〜2月)は全アクティビティが要予約。開催時刻は公式サイトで要確認。"
        },
        {
          name: "クリアカヤック体験ツアー",
          description: "船底が透明なカヤックで海中を覗きながら漕ぐ体験ツアー。",
          hours: null,
          location: "フサキビーチ",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/activity/category/fusaki",
          mapUrl: null,
          tips: "要予約。料金目安 1艇2名利用で6,700円〜。開催時刻は公式サイトで要確認。"
        },
        {
          name: "グラスボート遊覧",
          description: "船底がガラス張りのボートで、濡れずにサンゴ礁と熱帯魚を観察できる。泳がない人でも楽しめる。",
          hours: null,
          location: "フサキビーチ桟橋",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/activity/category/fusaki",
          mapUrl: null,
          tips: "通年開催。冬季は前日までの予約が必要。運航時刻と料金は公式サイトまたはツアーデスクで要確認。"
        },
        {
          name: "当日受付のマリンメニュー(マリンジェット・ドラゴンボート・マーブル・Uチューブ ほか)",
          description: "予約不要で当日ビーチステーションに申し込める曳航系・ジェット系のアクティビティ。",
          hours: "ビーチステーション営業時間内(夏季 9:00〜18:30)",
          location: "フサキビーチ / ビーチステーション",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/activity/category/fusaki",
          mapUrl: null,
          tips: "当日受付。ただし水深が40cm未満に下がる干潮時はマリンジェット等が中止になる。料金は現地で要確認。"
        },
        {
          name: "レンタル(シーカヤック・ペダルボート・リーフシュノーケル・釣りセット・フロートマット)",
          description: "ガイドなしで自由に使えるビーチのレンタル用品。のんびり過ごしたい日向け。",
          hours: "ビーチステーション営業時間内",
          location: "フサキビーチ / ビーチステーション",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/activity/category/fusaki",
          mapUrl: null,
          tips: "当日受付。ペダルボートは干潮時に座礁リスクがあり長めに休止することがある。料金は現地で要確認。"
        },
        {
          name: "SUPヨガ / 朝ヨガ",
          description: "海上のボードの上で行うSUPヨガと、ビーチで行う朝ヨガ。静かな時間帯の大人向けプログラム。",
          hours: null,
          location: "フサキビーチ",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/activity/category/fusaki",
          mapUrl: null,
          tips: "SUPヨガは3月1日〜10月31日の特定曜日開催(9月中旬は開催期間内)。朝ヨガは通年。開催曜日・時刻・料金は要予約・要確認。"
        },
        {
          name: "星空ツアー「フサキ美ら星さんぽ」",
          description: "日本初の星空保護区に認定された八重山の夜空をガイドと歩きながら観察するナイトプログラム。",
          hours: null,
          location: "リゾート内",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/activity/category/fusaki",
          mapUrl: null,
          tips: "1月・2月は中止、水曜定休。9月は開催期間内。要予約。開催時刻・料金は公式サイトで要確認。曇天時は中止になることがある。"
        },
        {
          name: "ツアーデスク",
          description: "館内アクティビティのほか、離島(竹富島・西表島など)ツアーや島内観光の手配窓口。",
          hours: "7:30〜18:00",
          location: "セントラルヴィレッジ",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/tourdesk",
          mapUrl: null,
          tips: "高速船会社の無料送迎バス付き離島ツアーもここで申し込める。人気ツアーは早めの相談が安心。"
        }
      ]
    },

    {
      id: "facilities",
      title: "館内施設",
      icon: "🏨",
      items: [
        {
          name: "大浴場",
          description: "サウナを備えた宿泊者無料の大浴場。海遊びのあとの塩落としに便利。",
          hours: "6:00〜11:00 / 15:00〜23:00(最終受付22:30)",
          location: "リゾート内 大浴場棟",
          tel: null,
          url: "https://www.fusaki.com/spa_wellness/bathhouse",
          mapUrl: null,
          tips: "宿泊者無料。20:00〜22:00は混雑しやすいので早めか遅めが快適。タトゥーがある場合は事前に要確認。"
        },
        {
          name: "FUSAKI SPA",
          description: "バンフォードのプロダクトを使ったボディ・フェイシャルトリートメント。ペアルーム対応のメニューもある。",
          hours: "11:00〜20:30(最終受付19:00)",
          location: "リゾート内 スパ棟",
          tel: "0980-88-7098",
          url: "https://www.fusaki.com/spa/",
          mapUrl: null,
          tips: "要予約(オンライン https://fusakispa.spayoyaku.com/ または電話)。料金は公式サイトで要確認。夫婦・カップルはペアルームが人気なので早めの予約推奨。"
        },
        {
          name: "RESORT SHOP & MARKET",
          description: "土産物から飲料・日用品まで揃う館内のメインショップ。洗濯用洗剤もここで買える。",
          hours: "7:30〜22:00",
          location: "セントラルヴィレッジ",
          tel: null,
          url: "https://www.fusaki.com/shop7",
          mapUrl: null,
          tips: "洗剤は50円で販売。island土産はここでもひと通り揃うが、品数は市街地のユーグレナモールの方が多い。"
        },
        {
          name: "TERRACE SHOP",
          description: "夜遅くまで開いているショップ。夜food・ドリンクの買い足しに。",
          hours: "7:30〜23:00",
          location: "エイトスターズヴィレッジ",
          tel: null,
          url: "https://www.fusaki.com/shoplist/eightstars_shop",
          mapUrl: null,
          tips: "館内で最も遅くまで営業。部屋飲みの買い出しに便利。"
        },
        {
          name: "コインランドリー",
          description: "館内数ヶ所に設置された洗濯機・乾燥機。長期滞在や海遊びの多い日程で重宝する。",
          hours: "24時間(目安) ※設置場所は公式サイト/フロントで要確認",
          location: "館内数ヶ所",
          tel: null,
          url: "https://www.fusaki.com/faq/facility/142",
          mapUrl: null,
          tips: "料金目安: 洗濯機1回200円(洗剤なし)・300円(洗剤あり)、乾燥機30分100円。洗剤は RESORT SHOP & MARKET で50円。"
        },
        {
          name: "アニマルスクエア",
          description: "ヤギなどの動物と触れ合える館内の一角。散歩コースの途中に立ち寄れる。",
          hours: null,
          location: "リゾート内",
          tel: null,
          url: "https://www.fusaki.com/facility/animalsquare",
          mapUrl: null,
          tips: "動物プログラムは水曜定休。営業時間は公式サイトで要確認。"
        },
        {
          name: "ベビー&キッズルーム「AYAPANI」",
          description: "キッズ向けの屋内プレイルーム。大人のみの旅では利用機会は少ないが館内マップの目印になる。",
          hours: "9:00〜19:00",
          location: "アクアガーデン内",
          tel: null,
          url: "https://www.fusaki.com/facility/aquagarden/ayapani",
          mapUrl: null,
          tips: "通年営業。"
        }
      ]
    },

    {
      id: "nearby",
      title: "周辺スポット",
      icon: "🗺",
      items: [
        {
          name: "川平湾(かびらわん)",
          description: "日本百景にも選ばれた石垣島随一の絶景。エメラルドグリーンの海と白砂、点在する小島のコントラストが見事。",
          hours: "見学自由(グラスボートは概ね9:00〜17:00)",
          location: "沖縄県石垣市川平 / ホテルから車で約20分",
          tel: null,
          url: "https://www.fusaki.com/spot/archives/spot/21",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%B7%9D%E5%B9%B3%E6%B9%BE",
          tips: "遊泳禁止。海の色は太陽が高い10:00〜14:00が最も美しい。グラスボート料金は現地で要確認。売店・カフェあり。"
        },
        {
          name: "御神崎灯台(おがんざきとうだい)",
          description: "石垣島西端の岬に立つ白い灯台。断崖と東シナ海を見渡す、島屈指のサンセットスポット。",
          hours: "見学自由(灯台内部は非公開)",
          location: "沖縄県石垣市崎枝 / ホテルから車で約30分",
          tel: null,
          url: "https://www.fusaki.com/spot/archives/spot/271",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%BE%A1%E7%A5%9E%E5%B4%8E%E7%81%AF%E5%8F%B0",
          tips: "日没の30分前には到着したい。街灯がなく帰り道は真っ暗なのでヘッドライト必須。風が強く足元は崖なので端に寄りすぎない。"
        },
        {
          name: "石垣島鍾乳洞",
          description: "20万年かけて形成された全長3.2kmの鍾乳洞のうち660mを公開。遊歩道が整備され雨の日でも楽しめる。",
          hours: "9:00〜18:30(最終入洞受付18:00)",
          location: "沖縄県石垣市石垣1666 / ホテルから車で約17分",
          tel: null,
          url: "https://www.fusaki.com/spot/archives/spot/261",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E7%9F%B3%E5%9E%A3%E5%B3%B6%E9%8D%BE%E4%B9%B3%E6%B4%9E",
          tips: "所要30〜40分。入洞料は現地で要確認。洞内は滑りやすいのでサンダルより靴が安心。雨天時のプランBに最適。"
        },
        {
          name: "ユーグレナモール / 石垣市公設市場",
          description: "730交差点そばにある全長265mの日本最南端のアーケード商店街。土産店・雑貨店と、島の台所である公設市場が並ぶ。",
          hours: "店舗により異なる(公設市場は9:00〜20:00 / 第2・第4日曜定休)",
          location: "沖縄県石垣市大川 / ホテルから車で約15分",
          tel: null,
          url: "https://www.euglenamall.com/",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%A6%E3%83%BC%E3%82%B0%E3%83%AC%E3%83%8A%E3%83%A2%E3%83%BC%E3%83%AB",
          tips: "賑わうのは10:00〜18:00頃。土産の買い出しはここが本命。公設市場2階に石垣市特産品販売センターあり。"
        },
        {
          name: "美崎町(市街地の飲食店エリア)",
          description: "離島ターミナル近くに広がる石垣島最大の飲食店・居酒屋エリア。石垣牛や八重山そば、島魚の店が集まる大人の夜の目的地。",
          hours: "店舗により異なる(概ね18:00〜24:00)",
          location: "沖縄県石垣市美崎町 / ホテルから車で約15分",
          tel: null,
          url: null,
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E7%9F%B3%E5%9E%A3%E5%B8%82%E7%BE%8E%E5%B4%8E%E7%94%BA",
          tips: "人気店は要予約。飲酒するならタクシー往復(片道1,800円〜が目安)。路線バス(川平リゾート線)は本数が少なく夜は使いにくいので要確認。"
        },
        {
          name: "玉取崎展望台",
          description: "島の北東部、くびれた地形を見下ろす展望台。太平洋と東シナ海を同時に望む開放的な景色。",
          hours: "見学自由",
          location: "沖縄県石垣市伊原間 / ホテルから車で約40分",
          tel: null,
          url: "https://www.fusaki.com/spot/archives/spot/267",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E7%8E%89%E5%8F%96%E5%B4%8E%E5%B1%95%E6%9C%9B%E5%8F%B0",
          tips: "無料駐車場・トイレあり。平久保崎へ向かう北部ドライブの途中に寄るのが定番。"
        },
        {
          name: "平久保崎灯台",
          description: "石垣島最北端の岬に立つ灯台。360度を海に囲まれたような雄大な景色が広がる。",
          hours: "見学自由",
          location: "沖縄県石垣市平久保 / ホテルから車で約70分",
          tel: null,
          url: "https://www.fusaki.com/spot/archives/spot/274",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%B9%B3%E4%B9%85%E4%BF%9D%E5%B4%8E%E7%81%AF%E5%8F%B0",
          tips: "片道70分なので半日確保したい。北部は店もガソリンスタンドも少ないので給油と飲み物は市街地で。星空の名所でもある。"
        },
        {
          name: "米原のヤエヤマヤシ群落",
          description: "国の天然記念物に指定された自生ヤエヤマヤシの群落。亜熱帯の森を短い遊歩道で歩ける。",
          hours: "見学自由",
          location: "沖縄県石垣市米原 / ホテルから車で約30分",
          tel: null,
          url: "https://www.fusaki.com/spot/archives/spot/264",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E7%B1%B3%E5%8E%9F%E3%81%AE%E3%83%A4%E3%82%A8%E3%83%A4%E3%83%9E%E3%83%A4%E3%82%B7%E7%BE%A4%E8%90%BD",
          tips: "所要15〜20分。蚊が多いので虫よけ推奨。川平湾からの帰り道に寄りやすい。"
        },
        {
          name: "宮良川のマングローブ林(ヒルギ林)",
          description: "国の天然記念物に指定された亜熱帯のマングローブ林。カヌーツアーの拠点にもなっている。",
          hours: "見学自由(ツアーは要予約)",
          location: "沖縄県石垣市宮良 / ホテルから車で約25分",
          tel: null,
          url: "https://www.fusaki.com/spot/archives/spot/279",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%AE%AE%E8%89%AF%E5%B7%9D%E3%81%AE%E3%83%92%E3%83%AB%E3%82%AE%E6%9E%97",
          tips: "橋の上からも眺められる。カヌー・SUPツアーで中に入る場合は各社の予約が必要。潮位で景観が変わる。"
        },
        {
          name: "石垣やいま村",
          description: "赤瓦の古民家を移築したテーマパーク。八重山の暮らしと文化に触れられ、名蔵湾を望むマングローブ遊歩道もある。",
          hours: null,
          location: "沖縄県石垣市名蔵 / ホテルから車で約13分",
          tel: null,
          url: "https://www.fusaki.com/spot/archives/spot/428",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E7%9F%B3%E5%9E%A3%E3%82%84%E3%81%84%E3%81%BE%E6%9D%91",
          tips: "ホテルから最も近い観光施設のひとつ。営業時間・入村料は公式サイトで要確認。リスザルの森あり。"
        }
      ]
    },

    {
      id: "access",
      title: "アクセス・交通",
      icon: "🚌",
      items: [
        {
          name: "無料シャトルバス(南ぬ島石垣空港 ⇔ ホテル)",
          description: "宿泊者向けの無料送迎バス。空港とホテルを定時運行で結ぶ。所要約35分。",
          hours: "2026/7/1〜10/24の空港発: 9:15 / 11:10 / 12:10 / 13:10 / 15:10 / 16:10 / 17:10 / 18:10 ※2026/10/25以降は時刻変更",
          location: "空港到着口前のバスプールに待機(貸切バス乗り場ではない)",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/access/pickup",
          mapUrl: null,
          tips: "無料・予約不要だが座席数に限りがあり満席だと次便待ち。フライト遅延でも定刻発車。台風時は運休。出発直前に公式サイトで時刻を要再確認。"
        },
        {
          name: "タクシー(空港 ⇔ ホテル)",
          description: "空港からホテルまで約35分。荷物が多い、便がシャトルの時刻と合わない場合に。",
          hours: "24時間(配車センターは終日対応の会社あり)",
          location: "南ぬ島石垣空港 タクシー乗り場",
          tel: "0980-82-4649",
          url: null,
          mapUrl: null,
          tips: "料金目安は片道約4,000円〜。市街地(離島ターミナル・美崎町)まではホテルから約15分・1,800円〜が目安。配車アプリ DiDi も利用可。料金は要確認。"
        },
        {
          name: "レンタカー",
          description: "空港からホテルまで約35分。川平湾・御神崎・平久保崎など島内観光をするなら実質必須。",
          hours: "各社営業時間による",
          location: "南ぬ島石垣空港周辺のレンタカー各社",
          tel: "0980-88-7000",
          url: "https://www.fusaki.com/access",
          mapUrl: null,
          tips: "ホテル経由での手配も可能。繁忙期は早めの予約を。ホテルの駐車場は広いが、夜のドライブに備え給油は市街地で。"
        },
        {
          name: "路線バス(東運輸 川平リゾート線ほか)",
          description: "空港からはバスターミナル経由で約35分+乗継。ホテル〜市街地は川平リゾート線で約20分。",
          hours: "便により異なる(本数が少なく夜は早じまい)",
          location: "「フサキビーチリゾート」バス停",
          tel: null,
          url: "http://www.azumabus.co.jp/",
          mapUrl: null,
          tips: "ホテル〜市街地は360円/人が目安(要確認)。空港からは4番・10番系統。夜の飲食にはダイヤが合わないことが多いのでタクシー併用が現実的。"
        },
        {
          name: "石垣港離島ターミナル(竹富島・西表島などへの玄関口)",
          description: "ホテルから車で約15分。竹富島や西表島など離島への高速船が発着する。",
          hours: "各高速船会社の運航ダイヤによる",
          location: "沖縄県石垣市美崎町1 / ホテルから車で約15分",
          tel: null,
          url: null,
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E7%9F%B3%E5%9E%A3%E6%B8%AF%E9%9B%A2%E5%B3%B6%E3%82%BF%E3%83%BC%E3%83%9F%E3%83%8A%E3%83%AB",
          tips: "タクシー約1,800円〜、路線バス約20分・360円が目安。ホテルのツアーデスク経由なら高速船会社の無料送迎バス付きツアーを手配できる。"
        }
      ]
    }
  ],

  links: [
    {
      label: "石垣島地方気象台(気象庁)",
      url: "https://www.jma-net.go.jp/ishigaki/",
      tel: null,
      note: "台風・大雨情報はここで確認"
    },
    {
      label: "気象庁 天気予報(八重山地方)",
      url: "https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=474000",
      tel: null,
      note: "沖縄県(八重山地方)の週間予報"
    },
    {
      label: "フサキビーチリゾート 公式サイト",
      url: "https://www.fusaki.com/",
      tel: "0980-88-7000",
      note: "ホテル代表電話"
    },
    {
      label: "フサキ 公式アクティビティページ",
      url: "https://www.fusaki.com/activity/category/fusaki",
      tel: null,
      note: "開催時刻・料金の最新情報はここ"
    },
    {
      label: "フサキ レストラン予約",
      url: "https://www.fusaki.com/restaurant",
      tel: "0980-88-7095",
      note: "レストラン専用番号 受付9:00〜20:00"
    },
    {
      label: "FUSAKI SPA 予約",
      url: "https://fusakispa.spayoyaku.com/",
      tel: "0980-88-7098",
      note: "スパ直通"
    },
    {
      label: "無料シャトルバス時刻表",
      url: "https://www.fusaki.com/access/pickup",
      tel: null,
      note: "出発前に最新時刻を確認"
    },
    {
      label: "タクシー(石垣島タクシー コールセンター)",
      url: null,
      tel: "0980-82-4649",
      note: "24時間配車。ホテル⇔市街地 約15分・1,800円〜が目安"
    },
    {
      label: "タクシー(先島交通)",
      url: "https://sakishima.jp/",
      tel: "0980-82-3988",
      note: "観光タクシーの手配も可"
    },
    {
      label: "東運輸(路線バス)",
      url: "http://www.azumabus.co.jp/",
      tel: null,
      note: "川平リゾート線などの時刻表"
    },
    {
      label: "南ぬ島石垣空港",
      url: "https://www.ishigaki-airport.co.jp/",
      tel: null,
      note: "フライト状況・交通案内"
    }
  ],

  emergency: [
    {
      label: "警察",
      tel: "110",
      note: "事件・事故。石垣島は観光レンタカーの事故が多いので注意"
    },
    {
      label: "消防・救急",
      tel: "119",
      note: "急病・けが・火災"
    },
    {
      label: "ホテルフロント(24時間)",
      tel: "0980-88-7000",
      note: "体調不良時はまずフロントへ。医療機関の案内をしてくれる"
    },
    {
      label: "沖縄県立八重山病院",
      tel: "0980-87-5557",
      note: "石垣市真栄里584-1。八重山医療圏で唯一の総合病院・救急対応。ホテルから車で約20分"
    },
    {
      label: "かりゆし病院(石垣市)",
      tel: "0980-83-5600",
      note: "石垣市内の総合病院。診療時間は要確認"
    },
    {
      label: "海上保安庁(海の事故)",
      tel: "118",
      note: "マリンアクティビティ中の海難事故"
    }
  ]
};
