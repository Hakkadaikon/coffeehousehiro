import { ChevronLeft, ChevronRight, Instagram, Mail, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";

const SLIDESHOW_IMAGES = [
	"/images/IMAGE_1.jpeg",
	"/images/IMAGE_2.jpeg",
	"/images/IMAGE_3.jpeg",
	"/images/IMAGE_4.jpeg",
	"/images/IMAGE_5.jpeg",
	"/images/IMAGE_6.jpeg",
	"/images/IMAGE_7.jpeg",
	"/images/IMAGE_8.jpeg",
	"/images/IMAGE_9.jpeg",
	"/images/IMAGE_10.jpeg",
];

const LINE_URL = "https://lin.ee/Zp3za2N";
const MENU_START_DATE = "2026年10月1日";

const MENU: { title: string; note: string; unit: string; items: [string, string, string][] }[] = [
	{
		title: "シングル",
		note: "豆・粉　／　浅煎り・中煎り・中深煎り・おまかせ",
		unit: "100g / 200g",
		items: [
			["タンザニア", "キリマンジャロ AA", "¥450 / ¥850"],
			["エチオピア", "モカ、イルガチェフェ G1", "¥500 / ¥1,000"],
			["エチオピア", "モカ、ゲラ農園 G1", "¥450 / ¥850"],
			["グァテマラ", "", "¥450 / ¥850"],
			["ブラジル", "", "¥450 / ¥850"],
			["インドネシア", "マンデリン", "¥450 / ¥850"],
			["ケニア", "", "¥500 / ¥1,000"],
			["コロンビア", "", "¥450 / ¥850"],
			["ブルンジ", "", "¥450 / ¥850"],
		],
	},
	{
		title: "ブレンド",
		note: "豆・粉　／　浅煎り・中煎り・中深煎り・おまかせ",
		unit: "100g / 200g",
		items: [
			["タンザニア", "キリマンジャロ", "¥450 / ¥850"],
			["エチオピア", "モカ", "¥450 / ¥850"],
			["ブラジル", "", "¥450 / ¥850"],
			["インドネシア", "", "¥450 / ¥850"],
			["おまかせ", "", "¥450 / ¥850"],
		],
	},
	{
		title: "スペシャル",
		note: "なくなり次第終了",
		unit: "",
		items: [
			["エクアドル", "ガラパゴス諸島　100g / 200g", "¥800 / ¥1,600"],
			["ネパール", "ヒマラヤンスペシャル、アナエロビックナチュラル　100g / 200g", "¥850 / ¥1,700"],
			["パナマ", "ゲイシャ、エル・パロマール農園、浅煎りのみ　20g / 100g", "¥500 / ¥2,200"],
		],
	},
	{
		title: "ドリップバッグ",
		note: "",
		unit: "0.5 アイテム分",
		items: [
			["シングル 5枚セット", "上記シングルから", "¥570"],
			["スペシャル 5枚セット", "", "時価・要相談"],
			["おまかせ 5枚セット", "", "¥570"],
		],
	},
];

function Slideshow() {
	const n = SLIDESHOW_IMAGES.length;
	const [current, setCurrent] = useState(0);
	const [animating, setAnimating] = useState(false);

	const getOffset = (i: number) => {
		let diff = i - current;
		if (diff > n / 2) diff -= n;
		if (diff < -n / 2) diff += n;
		return diff;
	};

	const go = useCallback(
		(next: number) => {
			if (animating) return;
			setAnimating(true);
			setCurrent(next);
			setTimeout(() => setAnimating(false), 600);
		},
		[animating],
	);

	const prev = () => go((current - 1 + n) % n);
	const next = () => go((current + 1) % n);

	return (
		<div
			className="relative w-full select-none overflow-hidden bg-[#0e0b0a]"
			style={{ height: "60vw", maxHeight: "80vh" }}
		>
			{SLIDESHOW_IMAGES.map((src, idx) => {
				const offset = getOffset(idx);
				return (
					<div
						key={src}
						className="absolute inset-0 flex items-center justify-center"
						style={{
							transform: `translateX(${offset * 100}%)`,
							transition:
								Math.abs(offset) > 1 ? "none" : "transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1)",
						}}
					>
						<img src={src} alt={`Gallery ${idx + 1}`} className="h-full w-auto" />
					</div>
				);
			})}

			{/* 両端グラデーション（矢印の視認性向上） */}
			<div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-espresso/30 to-transparent pointer-events-none z-10" />
			<div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-espresso/30 to-transparent pointer-events-none z-10" />

			{/* Arrows */}
			<button
				type="button"
				onClick={prev}
				className="absolute left-4 top-1/2 -translate-y-1/2 bg-espresso/50 hover:bg-espresso/80 text-paper p-3 transition-colors z-20"
				aria-label="前の画像"
			>
				<ChevronLeft className="w-5 h-5" />
			</button>
			<button
				type="button"
				onClick={next}
				className="absolute right-4 top-1/2 -translate-y-1/2 bg-espresso/50 hover:bg-espresso/80 text-paper p-3 transition-colors z-20"
				aria-label="次の画像"
			>
				<ChevronRight className="w-5 h-5" />
			</button>

			{/* Dots */}
			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
				{SLIDESHOW_IMAGES.map((src, idx) => (
					<button
						type="button"
						key={src}
						onClick={() => go(idx)}
						className={`w-2 h-2 rounded-full transition-colors ${idx === current ? "bg-paper" : "bg-paper/40"}`}
						aria-label={`画像 ${idx + 1}`}
					/>
				))}
			</div>
		</div>
	);
}

export default function App() {
	const fadeIn = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
	};

	const staggerContainer = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.2 },
		},
	};

	return (
		<div className="min-h-screen bg-paper text-espresso font-sans">
			{/* Navigation */}
			<nav className="absolute top-0 w-full z-50 py-5 px-6 md:px-12 flex justify-between items-center text-paper">
				{/* ロゴ: 文字サイズ・トラッキング調整 */}
				<div className="font-serif text-base md:text-2xl tracking-[0.15em] flex items-center gap-3">
					コーヒーhouseヒロ
				</div>
				{/* ナビ: 文字サイズをxsからsmに拡大、視認性向上 */}
				<div className="hidden md:flex gap-10 md:text-base lg:text-lg font-medium tracking-[0.15em] uppercase">
					<a href="#about" className="hover:text-caramel transition-colors">
						Concept
					</a>
					<a href="#menu" className="hover:text-caramel transition-colors">
						Menu
					</a>
					<a href="#order" className="hover:text-caramel transition-colors">
						Order
					</a>
					<a href="#access" className="hover:text-caramel transition-colors">
						Access
					</a>
				</div>
				<a
					href={LINE_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755] hover:bg-[#05b14c] text-white text-xs md:text-base md:px-5 md:py-2.5 font-medium tracking-wider transition-colors"
				>
					<MessageCircle className="w-4 h-4" />
					LINE注文
				</a>
			</nav>

			{/* Hero Section */}
			<section className="relative min-h-[100svh] md:min-h-[90vh] flex items-center px-6 overflow-hidden bg-espresso text-paper">
				<div className="absolute inset-0 z-0">
					<img
						src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1920&auto=format&fit=crop"
						alt="Coffee roasting"
						className="w-full h-full object-cover opacity-30 scale-105"
						referrerPolicy="no-referrer"
					/>
					{/* グラデーションを強めてコントラスト向上 */}
					<div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/40 to-espresso/60"></div>
				</div>

				<div className="max-w-6xl lg:max-w-7xl w-full mx-auto relative z-10 pt-24 pb-16 md:pt-28 md:pb-24">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={fadeIn}
						className="w-full flex flex-col md:flex-row md:items-center gap-8 md:gap-12 lg:gap-16"
					>
						<div className="md:flex-none">
							{/* キャッチコピー: 行間を広げてコントラスト強化 */}
							<h1 className="font-serif text-[clamp(26px,3.5vw,52px)] leading-[1.8] mb-8 tracking-wider">
								<span className="block whitespace-nowrap">平日はサラリーマン、</span>
								<span className="block whitespace-nowrap text-paper/70">週末はロースター。</span>
							</h1>
							<p className="text-paper/80 tracking-[0.2em] font-light text-sm md:text-xl border-l-2 border-caramel pl-4 py-1">
								スペシャルティコーヒーの舞台へ
							</p>
							<a
								href={LINE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-10 inline-flex w-full sm:w-auto justify-center items-center gap-3 px-8 py-4 md:text-xl md:px-10 md:py-5 bg-[#06C755] hover:bg-[#05b14c] text-white font-medium tracking-wider shadow-lg shadow-black/30 transition-colors"
							>
								<MessageCircle className="w-5 h-5" />
								LINEで注文する
							</a>
						</div>
						<div className="order-first md:order-none md:flex-1 min-w-0 flex justify-center md:justify-end">
							<img
								src="/images/logo.webp"
								alt="コーヒーhouseヒロ"
								className="w-full max-w-[420px] md:max-w-[min(680px,78vh)] h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
							/>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Concept */}
			<section id="about" className="py-24 md:py-32 px-6 md:px-12 bg-paper relative">
				<div className="absolute top-0 left-12 w-px h-24 bg-espresso/10 hidden md:block"></div>
				<div className="max-w-5xl mx-auto">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						variants={fadeIn}
					>
						<h2 className="font-serif text-2xl sm:text-3xl md:text-[44px] mb-16 md:mb-20 text-center tracking-wider md:tracking-widest leading-loose">
							<span className="inline-block">こだわりの一杯を、</span>
							<span className="inline-block">手作りの赤い小屋から。</span>
						</h2>

						{/* 画像とテキストの高さを揃える: items-start + 画像をauto高さに */}
						<div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
							<div className="relative overflow-hidden group">
								<div className="absolute inset-0 bg-espresso/5 z-10 group-hover:bg-transparent transition-colors duration-700"></div>
								<img
									src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop"
									alt="Brewing coffee"
									className="w-full h-auto object-cover filter grayscale-[40%] contrast-[1.1] group-hover:scale-105 transition-transform duration-1000 ease-out"
									referrerPolicy="no-referrer"
								/>
							</div>
							{/* テキスト: 行間・段落間を広げて読みやすく */}
							<div className="space-y-7 font-serif leading-[2] text-roast tracking-wide lg:tracking-normal text-pretty pt-2">
								<p className="text-base md:text-lg lg:text-xl">
									月曜日から金曜日は、ごく普通のサラリーマン。しかし土日・祝日になると、岡山県倉敷市の小さな赤い小屋で、情熱を持ったロースターへと姿を変えます。
								</p>
								<p className="text-base md:text-lg lg:text-xl">
									ブラックコーヒーとアイスコーヒーを専門に扱っており、豆本来の個性を引き出す焙煎を丹念に行っています。
								</p>
								<div className="pt-6 border-t border-espresso/10 space-y-3">
									<p className="text-xs md:text-sm tracking-widest uppercase text-caramel font-sans">
										Qualification
									</p>
									<p className="font-serif text-sm md:text-lg tracking-widest leading-relaxed">
										J.C.Q.A. 認定コーヒーインストラクター 2級
									</p>
									<p className="font-sans text-xs md:text-base text-roast/75 tracking-wider leading-relaxed">
										たしかな知識と技術で、最高の1杯をお届けします。
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Gallery Slideshow: セクション余白を削除してフル幅に */}
			<section>
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={fadeIn}
				>
					<Slideshow />
				</motion.div>
			</section>

			{/* Menu */}
			<section id="menu" className="py-24 md:py-32 px-6 md:px-12 bg-[#EFECE5]">
				<div className="max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto relative">
					<div className="text-center mb-16 md:mb-20">
						<h2 className="font-serif text-4xl md:text-[44px] tracking-widest mb-3">商品一覧</h2>
						<p className="text-xs md:text-sm tracking-[0.2em] text-espresso/60 uppercase">Menu</p>
						<p className="text-xs md:text-base tracking-widest text-roast/75 mt-4">
							{MENU_START_DATE}より価格・メニューを改定しました
						</p>
					</div>

					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={staggerContainer}
						className="space-y-16"
					>
						{MENU.map((cat, i) => (
							<motion.div
								key={cat.title}
								variants={fadeIn}
								className={`relative ${cat.title === "スペシャル" ? "bg-paper border border-caramel/30 p-6 md:p-10 shadow-sm" : ""}`}
							>
								<div className="border-b border-espresso/20 pb-5 mb-8">
									<span className="block font-serif text-caramel text-sm md:text-lg tracking-widest mb-2">
										0{i + 1}
									</span>
									<h3 className="font-serif text-xl md:text-[32px] tracking-widest mb-1">
										{cat.title}
										{cat.title === "スペシャル" && (
											<span className="ml-3 text-[11px] md:text-[13px] font-sans bg-caramel text-paper px-2 py-0.5 align-middle tracking-wider">
												LIMITED
											</span>
										)}
									</h3>
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1 sm:gap-4">
										{cat.note && (
											<p className="text-xs md:text-base text-roast/70 font-sans tracking-wider">
												{cat.note}
											</p>
										)}
										<span className="text-xs md:text-base tracking-wider text-roast/75 font-sans shrink-0">
											{cat.unit}
										</span>
									</div>
								</div>

								<div className="space-y-5 md:space-y-7 font-serif text-lg md:text-2xl text-roast lg:px-6">
									{cat.items.map(([name, sub, price]) => (
										<div key={name + sub} className="group">
											<div className="flex items-baseline justify-between">
												<span className="shrink-0 tracking-wider md:tracking-widest">{name}</span>
												<div className="flex-grow min-w-4 border-b border-dotted border-espresso/25 mx-2 md:mx-10"></div>
												<span className="tracking-wide md:tracking-widest text-base md:text-2xl font-medium tabular-nums whitespace-nowrap">
													{price}
												</span>
											</div>
											{sub && (
												<p className="text-[13px] md:text-[17px] text-roast/80 tracking-wider mt-1">
													{sub}
												</p>
											)}
										</div>
									))}
								</div>
							</motion.div>
						))}
					</motion.div>

					{/* 送料: 目立つよう強調 */}
					<motion.div variants={fadeIn} className="mt-16 pt-10 border-t border-espresso/15">
						<p className="text-sm md:text-lg font-sans tracking-widest text-roast/80 text-center">
							<span className="inline-block">送料：全国一律、</span>
							<span className="inline-block">
								2アイテム分ごとに
								<span className="font-serif text-2xl md:text-[32px] mx-1 text-caramel font-medium">
									¥270
								</span>
							</span>
							<span className="inline-block">頂戴いたします。</span>
						</p>
					</motion.div>
				</div>
			</section>

			{/* How to Order */}
			<section id="order" className="py-24 md:py-32 px-6 md:px-12 bg-espresso text-paper">
				<div className="max-w-4xl lg:max-w-5xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="font-serif text-4xl md:text-[44px] tracking-widest mb-3">ご注文方法</h2>
						<p className="text-xs md:text-sm tracking-[0.2em] text-paper/60 uppercase">
							How to order
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-10 md:gap-8 mb-20 font-serif relative">
						<div className="hidden md:block absolute top-[1.5rem] left-0 w-full h-px bg-paper/10"></div>
						{[
							{
								num: "I",
								title: "LINEにて承ります",
								desc: "ご希望の商品名・数量（コーヒーの場合は状態や焙煎度）をお知らせください。LINE をご利用でない方はメールでも承ります。",
							},
							{
								num: "II",
								title: "お支払いのご案内",
								desc: "折り返し、商品代金と送料の合計、およびお支払い先情報（PayPay・楽天Pay・銀行振込）をご連絡します。",
							},
							{
								num: "III",
								title: "焙煎と発送",
								desc: "ご入金確認後の週末に、丁寧に焙煎を行い新鮮な状態でご指定先へ発送いたします。",
							},
						].map((step) => (
							<div key={step.num} className="relative z-10 md:px-4">
								{/* ステップ番号: border強化・背景色を少し明るく視認性向上 */}
								<div className="w-12 h-12 bg-roast/40 border border-paper/20 flex items-center justify-center text-paper/80 font-serif text-lg mb-7">
									{step.num}
								</div>
								<h3 className="text-base md:text-xl tracking-widest mb-4 text-paper/90">
									{step.title}
								</h3>
								<p className="text-sm md:text-[17px] text-paper/80 leading-[1.9] text-left tracking-wide text-pretty">
									{step.desc}
								</p>
							</div>
						))}
					</div>

					<div className="bg-[#241A16] p-6 md:p-16 text-center relative overflow-hidden">
						<div className="absolute -inset-1 border-[0.5px] border-paper/5 m-4 pointer-events-none"></div>
						<MessageCircle className="w-6 h-6 text-[#06C755] mx-auto mb-6" />
						<p className="font-sans text-sm md:text-lg tracking-widest text-paper/70 mb-8">
							ご注文・お問い合わせは LINE が便利です
						</p>
						<a
							href={LINE_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex w-full sm:w-auto justify-center items-center gap-3 px-6 md:px-12 py-4 md:py-5 whitespace-nowrap tracking-wider md:tracking-widest text-base md:text-xl font-bold bg-[#06C755] hover:bg-[#05b14c] text-white shadow-lg shadow-[#06C755]/20 transition-colors"
						>
							<MessageCircle className="w-5 h-5" />
							LINEで注文・問い合わせ
						</a>
						<div className="mt-12 pt-8 border-t border-paper/10">
							<p className="text-xs md:text-base text-paper/65 tracking-widest mb-3">
								LINE をご利用でない方はメールにて
							</p>
							<a
								href="mailto:coffeehousehiro@gmail.com"
								className="inline-flex items-center gap-2 font-serif text-sm md:text-lg text-paper/75 hover:text-caramel transition-colors tracking-widest break-all"
							>
								<Mail className="w-4 h-4" />
								coffeehousehiro@gmail.com
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Footer / Access */}
			<footer id="access" className="bg-[#120D0B] text-paper pt-20 pb-12 px-6 md:px-12">
				<div className="max-w-5xl mx-auto">
					<div className="grid md:grid-cols-2 gap-14 md:gap-8 mb-20">
						<div>
							<p className="font-serif text-lg md:text-xl tracking-widest mb-6 text-paper/90">
								コーヒーhouseヒロ
							</p>
							<div className="space-y-2 text-[13px] md:text-base text-paper/70 tracking-widest font-light mb-10">
								<p>〒712-8046</p>
								<p>岡山県倉敷市福田町福田 2370-6</p>
							</div>

							<a
								href="https://www.instagram.com/coffee_house_hiro"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-3 text-paper/75 hover:text-paper transition-colors tracking-widest text-[13px] md:text-base"
							>
								<Instagram className="w-4 h-4" />
								<span>@coffee_house_hiro</span>
							</a>
							<a
								href={LINE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 mt-3 text-[#06C755]/80 hover:text-[#06C755] transition-colors tracking-widest text-[13px] md:text-base"
							>
								<MessageCircle className="w-4 h-4" />
								<span>LINE 公式アカウント</span>
							</a>
						</div>

						<div className="font-serif leading-loose space-y-10 pr-4">
							<div>
								<h4 className="text-xs md:text-sm font-sans tracking-[0.3em] text-caramel mb-4 uppercase">
									Business Hours
								</h4>
								<p className="tracking-wider text-[14px] md:text-[17px] text-paper/80">
									<span className="text-paper/60 text-xs md:text-sm mr-3 font-sans">MON-FRI</span>{" "}
									サラリーマン
									<br />
									<span className="text-paper/60 text-xs md:text-sm mr-3 font-sans">SAT-SUN</span>{" "}
									ロースター・バリスタ
								</p>
								<p className="text-[11px] md:text-sm text-paper/60 mt-2 tracking-widest font-sans">
									（ブラックコーヒー、アイスコーヒー専門）
								</p>
							</div>

							<div>
								<h4 className="text-xs md:text-sm font-sans tracking-[0.3em] text-caramel mb-4 uppercase">
									Visit Details
								</h4>
								<p className="text-[13px] md:text-[17px] tracking-wide text-paper/80 leading-[1.9] text-pretty">
									1組4名様までの完全予約制となっております。
									<br />
									ご来店をご希望の際は、Instagram等のメッセージより事前にご連絡ください。赤い小屋にて、実際にコーヒーをお召し上がりいただけます。
								</p>
							</div>
						</div>
					</div>

					<div className="text-center font-sans tracking-[0.3em] text-[11px] md:text-[13px] text-paper/40 uppercase border-t border-white/5 pt-10">
						&copy; {new Date().getFullYear()} coffee house hiro. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
