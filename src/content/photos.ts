// サイトで使う写真の一覧。ファイル名・サイズ・代替テキストはここだけに書く。
// ファイル名は「2桁の連番_英語の要約.jpeg」。index.html の OGP と JSON-LD の画像も、ビルド時にここから埋める。
export type Photo = { src: string; w: number; h: number; alt: string };

export const PHOTOS: Photo[] = [
	{
		src: "/images/01_red-hut-exterior.jpeg",
		w: 1080,
		h: 1080,
		alt: "コーヒーhouseヒロの赤い小屋の外観",
	},
	{
		src: "/images/02_table-and-counter.jpeg",
		w: 1080,
		h: 810,
		alt: "4席のテーブルとカウンターがある店内",
	},
	{
		src: "/images/03_hand-roaster-and-kettle.jpeg",
		w: 1080,
		h: 810,
		alt: "手回し焙煎機と電気ケトル",
	},
	{ src: "/images/04_reserved-room.jpeg", w: 1080, h: 810, alt: "照明のある予約制の店内スペース" },
	{ src: "/images/05_bean-jars.jpeg", w: 1080, h: 644, alt: "焙煎豆の保存瓶" },
	{
		src: "/images/06_beans-in-roaster-drum.jpeg",
		w: 1080,
		h: 810,
		alt: "焙煎機のドラムの中で煎られるコーヒー豆",
	},
	{
		src: "/images/07_hand-drip-on-scale.jpeg",
		w: 1080,
		h: 810,
		alt: "スケールに載せたドリッパーでのハンドドリップ",
	},
	{
		src: "/images/08_brewed-coffee-and-server.jpeg",
		w: 1080,
		h: 810,
		alt: "抽出したコーヒーとサーバー",
	},
	{ src: "/images/09_roasted-beans.jpeg", w: 1080, h: 810, alt: "焙煎を終えたコーヒー豆" },
];

/** トップの背景。SNS で共有したときのサムネイルにも使う */
export const HERO = PHOTOS[5];
/** Concept 欄の写真 */
export const CONCEPT = PHOTOS[0];

/** Instagram欄に並べる順。先頭が大タイルで、モバイルでは先頭5枚だけ表示する */
export const INSTAGRAM_TILES = [5, 6, 2, 8, 7, 1, 3, 4, 0].map((i) => PHOTOS[i]);
