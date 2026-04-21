import { ChevronLeft, ChevronRight, Instagram, Mail } from "lucide-react";
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
			<nav className="absolute top-0 w-full z-50 py-5 px-6 md:px-12 flex justify-between items-center mix-blend-difference text-paper">
				{/* ロゴ: 文字サイズ・トラッキング調整 */}
				<div className="font-serif text-base md:text-lg tracking-[0.15em] flex items-center gap-3">
					<img
						src="/logo.png"
						alt="Logo"
						className="w-7 h-7 opacity-90 invert brightness-0"
						onError={(e) => (e.currentTarget.style.display = "none")}
					/>
					コーヒーhouseヒロ
				</div>
				{/* ナビ: 文字サイズをxsからsmに拡大、視認性向上 */}
				<div className="hidden md:flex gap-10 text-sm font-medium tracking-[0.15em] uppercase">
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
			</nav>

			{/* Hero Section */}
			<section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden bg-espresso text-paper">
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

				<div className="max-w-6xl w-full mx-auto relative z-10 pt-24 pb-16">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={fadeIn}
						className="w-full flex flex-col md:flex-row md:items-center gap-12"
					>
						<div className="flex-1">
							{/* ロゴ画像: 高さをclampで抑えて余白を解消 */}
							<div className="mb-10">
								<img
									src="/logo.png"
									alt="コーヒーhouseヒロ"
									className="h-[clamp(200px,30vw,400px)] w-auto invert brightness-0 opacity-90"
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
								/>
							</div>
							{/* キャッチコピー: 行間を広げてコントラスト強化 */}
							<h1 className="font-serif text-[clamp(22px,3.5vw,52px)] leading-[1.8] mb-8 tracking-wider">
								<span className="block whitespace-nowrap">平日はサラリーマン、</span>
								<span className="block whitespace-nowrap text-paper/70">週末はロースター。</span>
							</h1>
							<p className="text-paper/80 tracking-[0.2em] font-light text-sm md:text-base border-l-2 border-caramel pl-4 py-1">
								スペシャルティコーヒーの舞台へ
							</p>
						</div>
						<div className="flex-shrink-0 md:self-center flex justify-center">
							<img
								src="/images/logo.jpg"
								alt="コーヒーhouseヒロ"
								className="h-[clamp(200px,30vw,420px)] w-auto object-contain opacity-90"
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
						<h2 className="font-serif text-3xl md:text-4xl mb-16 md:mb-20 text-center tracking-widest leading-loose">
							こだわりの一杯を、
							<br className="md:hidden" />
							手作りの赤い小屋から。
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
							<div className="space-y-7 font-serif leading-[2] text-roast tracking-wide pt-2">
								<p className="text-base">
									月曜日から金曜日は、ごく普通のサラリーマン。しかし土日・祝日になると、岡山県倉敷市の小さな赤い小屋で、情熱を持ったロースターへと姿を変えます。
								</p>
								<p className="text-base">
									ブラックコーヒーとアイスコーヒーを専門に扱っており、豆本来の個性を引き出す焙煎を丹念に行っています。
								</p>
								<div className="pt-6 border-t border-espresso/10 space-y-3">
									<p className="text-[10px] tracking-widest uppercase text-espresso/40 font-sans">
										Qualification
									</p>
									<p className="font-serif text-sm tracking-widest leading-relaxed">
										J.C.Q.A. 認定コーヒーインストラクター 2級
									</p>
									<p className="font-sans text-xs text-roast/60 tracking-wider leading-relaxed">
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
				<div className="max-w-3xl mx-auto relative">
					<div className="text-center mb-16 md:mb-20">
						<h2 className="font-serif text-4xl tracking-widest mb-3">商品一覧</h2>
						<p className="text-xs tracking-[0.2em] text-espresso/50 uppercase">Menu</p>
					</div>

					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={staggerContainer}
						className="space-y-16"
					>
						{/* Coffee */}
						<motion.div variants={fadeIn} className="relative">
							{/* 見出しエリア: 上下余白を明確に */}
							<div className="border-b border-espresso/20 pb-5 mb-8">
								<h3 className="font-serif text-xl md:text-2xl tracking-widest mb-1">
									ブレンド・シングルオリジン
								</h3>
								<div className="flex items-center justify-between mt-2">
									<p className="text-[11px] text-roast/50 font-sans tracking-wider">
										粉・豆　／　浅煎り・中煎り・中深煎り
									</p>
									<span className="text-xs tracking-wider text-roast/40 font-sans">
										1 アイテム分
									</span>
								</div>
							</div>

							<div className="space-y-5 font-serif text-lg text-roast lg:px-6">
								<div className="flex items-baseline justify-between group">
									<span className="tracking-widest">100g</span>
									<div className="flex-grow border-b border-dotted border-espresso/20 mx-6 md:mx-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
									{/* 価格: 強調 */}
									<span className="tracking-widest font-medium">
										¥450<span className="text-sm font-normal ml-1 text-roast/60">〜</span>
									</span>
								</div>
								<div className="flex items-baseline justify-between group">
									<span className="tracking-widest">200g</span>
									<div className="flex-grow border-b border-dotted border-espresso/20 mx-6 md:mx-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
									<span className="tracking-widest font-medium">
										¥850<span className="text-sm font-normal ml-1 text-roast/60">〜</span>
									</span>
								</div>
							</div>
						</motion.div>

						{/* Drip Bag */}
						<motion.div variants={fadeIn} className="relative">
							<div className="border-b border-espresso/20 pb-5 mb-8">
								<h3 className="font-serif text-xl md:text-2xl tracking-widest mb-1">
									ドリップバッグ
								</h3>
								<div className="flex items-center justify-end mt-2">
									<span className="text-xs tracking-wider text-roast/40 font-sans">
										0.5 アイテム分
									</span>
								</div>
							</div>

							<div className="space-y-5 font-serif text-lg text-roast lg:px-6">
								<div className="flex items-baseline justify-between group">
									<span className="tracking-widest">5バッグセット</span>
									<div className="flex-grow border-b border-dotted border-espresso/20 mx-6 md:mx-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
									<span className="tracking-widest font-medium">¥570</span>
								</div>
							</div>
						</motion.div>

						{/* Peanuts */}
						<motion.div variants={fadeIn} className="relative">
							<div className="border-b border-espresso/20 pb-5 mb-8">
								<h3 className="font-serif text-xl md:text-2xl tracking-widest mb-1">
									自家焙煎 素焼きピーナッツ
								</h3>
								<div className="flex items-center justify-end mt-2">
									<span className="text-xs tracking-wider text-roast/40 font-sans">
										1 アイテム分
									</span>
								</div>
							</div>

							<div className="space-y-5 font-serif text-lg text-roast lg:px-6">
								<div className="flex items-baseline justify-between group">
									<span className="tracking-widest">200g</span>
									<div className="flex-grow border-b border-dotted border-espresso/20 mx-6 md:mx-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
									<span className="tracking-widest font-medium">¥100</span>
								</div>
							</div>
						</motion.div>
					</motion.div>

					{/* 送料: 目立つよう強調 */}
					<motion.div variants={fadeIn} className="mt-16 pt-10 border-t border-espresso/15">
						<p className="text-sm font-sans tracking-widest text-roast/70 text-center">
							送料：2アイテム分ごとに{" "}
							<span className="font-serif text-xl mx-1 text-espresso font-medium">¥200</span>{" "}
							頂戴いたします。
						</p>
					</motion.div>
				</div>
			</section>

			{/* How to Order */}
			<section id="order" className="py-24 md:py-32 px-6 md:px-12 bg-espresso text-paper">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="font-serif text-4xl tracking-widest mb-3">ご注文方法</h2>
						<p className="text-xs tracking-[0.2em] text-paper/40 uppercase">How to order</p>
					</div>

					<div className="grid md:grid-cols-3 gap-10 md:gap-8 mb-20 font-serif relative">
						<div className="hidden md:block absolute top-[1.5rem] left-0 w-full h-px bg-paper/10"></div>
						{[
							{
								num: "I",
								title: "メールにて承ります",
								desc: "ご希望の商品名・数量（コーヒーの場合は状態や焙煎度）をお知らせください。",
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
								<div className="w-12 h-12 bg-roast/40 border border-paper/20 flex items-center justify-center text-paper/80 font-serif text-lg mb-7 mx-auto md:mx-0">
									{step.num}
								</div>
								<h3 className="text-base tracking-widest mb-4 text-paper/90 text-center md:text-left">
									{step.title}
								</h3>
								<p className="text-[13px] text-paper/60 leading-[1.9] text-center md:text-left tracking-wide">
									{step.desc}
								</p>
							</div>
						))}
					</div>

					<div className="bg-[#241A16] p-10 md:p-16 text-center relative overflow-hidden">
						<div className="absolute -inset-1 border-[0.5px] border-paper/5 m-4 pointer-events-none"></div>
						<Mail className="w-5 h-5 text-paper/30 mx-auto mb-6" />
						<p className="font-sans text-[10px] tracking-[0.3em] text-paper/40 mb-8 uppercase">
							ご注文専用・お問い合わせ
						</p>
						<a
							href="mailto:coffeehousehiro@gmail.com"
							className="font-serif text-xl md:text-2xl text-paper hover:text-caramel transition-colors tracking-widest block break-all"
						>
							coffeehousehiro@gmail.com
						</a>
					</div>
				</div>
			</section>

			{/* Footer / Access */}
			<footer id="access" className="bg-[#120D0B] text-paper pt-20 pb-12 px-6 md:px-12">
				<div className="max-w-5xl mx-auto">
					<div className="grid md:grid-cols-2 gap-14 md:gap-8 mb-20">
						<div>
							<div className="mb-8">
								<img
									src="/logo.png"
									alt="Logo"
									className="w-20 opacity-40 invert brightness-0"
									onError={(e) => (e.currentTarget.style.display = "none")}
								/>
							</div>
							<p className="font-serif text-lg tracking-widest mb-6 text-paper/90">
								コーヒーhouseヒロ
							</p>
							<div className="space-y-2 text-[13px] text-paper/50 tracking-widest font-light mb-10">
								<p>〒712-8046</p>
								<p>岡山県倉敷市福田町福田 2370-6</p>
							</div>

							<a
								href="https://www.instagram.com/coffee_house_hiro"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-3 text-paper/40 hover:text-paper transition-colors tracking-widest text-[13px]"
							>
								<Instagram className="w-4 h-4" />
								<span>@coffee_house_hiro</span>
							</a>
						</div>

						<div className="font-serif leading-loose space-y-10 pr-4">
							<div>
								<h4 className="text-[10px] font-sans tracking-[0.3em] text-caramel/70 mb-4 uppercase">
									Business Hours
								</h4>
								<p className="tracking-wider text-[14px] text-paper/80">
									<span className="text-paper/40 text-xs mr-3 font-sans">MON-FRI</span> サラリーマン
									<br />
									<span className="text-paper/40 text-xs mr-3 font-sans">SAT-SUN</span>{" "}
									ロースター・バリスタ
								</p>
								<p className="text-[11px] text-paper/40 mt-2 tracking-widest font-sans">
									（ブラックコーヒー、アイスコーヒー専門）
								</p>
							</div>

							<div>
								<h4 className="text-[10px] font-sans tracking-[0.3em] text-caramel/70 mb-4 uppercase">
									Visit Details
								</h4>
								<p className="text-[13px] tracking-wide text-paper/70 leading-[1.9]">
									1組4名様までの完全予約制となっております。
									<br />
									ご来店をご希望の際は、Instagram等のメッセージより事前にご連絡ください。赤い小屋にて、実際にコーヒーをお召し上がりいただけます。
								</p>
							</div>
						</div>
					</div>

					<div className="text-center font-sans tracking-[0.3em] text-[9px] text-paper/20 uppercase border-t border-white/5 pt-10">
						&copy; {new Date().getFullYear()} coffee house hiro. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
