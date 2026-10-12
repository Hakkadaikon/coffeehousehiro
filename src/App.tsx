import { Mail, MapPin, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { categoryNote, categoryUnit, itemSub, MENU, MENU_START_DATE } from "./content/menu.ts";
import { CONCEPT, HERO, PHOTOS } from "./content/photos.ts";
import { ADDRESS, INSTAGRAM_URL, LINE_URL, MAP_URL, PAYMENTS, POSTAL } from "./content/shop.ts";
import OrderBuilder from "./OrderBuilder.tsx";
import { formatPrices } from "./order/pricing.ts";

/** lucide-react v1 で消えたブランドアイコンを、同じ線画で描く */
const Instagram = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		aria-hidden="true"
	>
		<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
		<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
		<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
	</svg>
);

// 先頭が大タイル。モバイルでは先頭 5 枚だけ表示する
const IG_TILES = [5, 6, 2, 8, 7, 1, 3, 4, 0].map((i) => PHOTOS[i]);
export default function App() {
	const fadeIn = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
		},
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
			<header>
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
			</header>
			<main>
				{/* Hero Section */}
				<section className="relative min-h-[100svh] md:min-h-[90vh] flex items-center px-6 overflow-hidden bg-espresso text-paper">
					<div className="absolute inset-0 z-0">
						<img
							src={HERO.src}
							alt=""
							width={HERO.w}
							height={HERO.h}
							fetchPriority="high"
							className="w-full h-full object-cover opacity-30 scale-105"
						/>
						{/* グラデーションを強めてコントラスト向上 */}
						<div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/40 to-espresso/60"></div>
					</div>

					<div className="max-w-6xl lg:max-w-7xl w-full mx-auto relative z-10 pt-24 pb-16 md:pt-28 md:pb-24">
						<motion.div
							initial={false}
							animate="visible"
							variants={fadeIn}
							className="w-full flex flex-col md:flex-row md:items-center gap-8 md:gap-12 lg:gap-16"
						>
							<div className="md:flex-none">
								{/* キャッチコピー: 行間を広げてコントラスト強化 */}
								<p className="font-serif text-[clamp(26px,3.5vw,52px)] leading-[1.8] mb-8 tracking-wider">
									<span className="block whitespace-nowrap">平日はサラリーマン、</span>
									<span className="block whitespace-nowrap text-paper/70">週末はロースター。</span>
								</p>
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
								<h1 className="contents">
									<img
										src="/images/logo.webp"
										alt="コーヒーhouseヒロ｜倉敷市の週末ロースター"
										width={800}
										height={633}
										className="w-full max-w-[420px] md:max-w-[min(680px,78vh)] h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
									/>
								</h1>
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
										src={CONCEPT.src}
										alt="倉敷市福田町にある手作りの赤い小屋の外観"
										width={CONCEPT.w}
										height={CONCEPT.h}
										loading="lazy"
										decoding="async"
										className="w-full h-auto object-cover filter grayscale-[40%] contrast-[1.1] group-hover:scale-105 transition-transform duration-1000 ease-out"
									/>
								</div>
								{/* テキスト: 行間・段落間を広げて読みやすく */}
								<div className="space-y-7 font-serif leading-[2] text-roast tracking-wide lg:tracking-normal text-pretty pt-2">
									<p className="text-base md:text-lg lg:text-xl">
										コーヒーhouseヒロの店主は、月曜日から金曜日はごく普通のサラリーマン。しかし土日・祝日になると、岡山県倉敷市の小さな赤い小屋で、情熱を持ったロースターへと姿を変えます。
									</p>
									<p className="text-base md:text-lg lg:text-xl">
										ブラックコーヒーとアイスコーヒーを専門に扱っており、豆本来の個性を引き出す焙煎を丹念に行っています。
									</p>
									<div className="pt-6 border-t border-espresso/10 space-y-3">
										<p className="text-xs md:text-sm tracking-widest uppercase text-caramel font-sans">
											Qualification
										</p>
										<p className="font-serif text-sm md:text-lg tracking-widest leading-relaxed">
											J.C.Q.A.認定コーヒーインストラクター2級
										</p>
										<p className="font-sans text-xs md:text-base text-roast/75 tracking-wider leading-relaxed">
											たしかな知識と技術で、最高の一杯をお届けします。
										</p>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</section>

				{/* Instagram */}
				<section id="instagram" className="py-24 md:py-32 px-6 md:px-12 bg-espresso text-paper">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						variants={fadeIn}
						className="max-w-5xl lg:max-w-6xl mx-auto"
					>
						<div className="text-center mb-12 md:mb-16">
							<p className="text-xs md:text-sm tracking-[0.3em] text-caramel uppercase mb-4">
								Instagram
							</p>
							<h2 className="font-serif text-3xl md:text-[44px] tracking-widest leading-snug mb-6">
								<span className="inline-block">営業日とお知らせは、</span>
								<span className="inline-block">Instagramで</span>
							</h2>
							<p className="text-sm md:text-lg text-paper/75 tracking-wide leading-[1.9] text-pretty">
								<span className="inline-block">営業日カレンダー、新しく入った豆、</span>
								<span className="inline-block">限定コーヒーのお知らせを発信しています。</span>
							</p>
						</div>

						<a
							href={INSTAGRAM_URL}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Instagramで@coffee_house_hiroの投稿を見る（新しいタブで開きます）"
							className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2"
						>
							{IG_TILES.map((img, i) => (
								<div
									key={img.src}
									className={`group/tile relative overflow-hidden bg-roast ${
										i === 0
											? "col-span-2 aspect-square md:row-span-2 md:aspect-auto"
											: "aspect-square"
									} ${i >= 5 ? "hidden md:block" : ""}`}
								>
									<img
										src={img.src}
										alt={img.alt}
										width={img.w}
										height={img.h}
										loading="lazy"
										decoding="async"
										className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover/tile:scale-105"
									/>
									<div className="absolute inset-0 bg-espresso/0 group-hover/tile:bg-espresso/45 transition-colors duration-500 flex items-center justify-center">
										<Instagram className="w-7 h-7 text-paper opacity-0 group-hover/tile:opacity-100 transition-opacity duration-500" />
									</div>
									{i === 0 && (
										<div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-espresso/85 to-transparent flex items-center gap-3">
											<Instagram className="w-5 h-5 md:w-6 md:h-6" />
											<span className="tracking-widest text-sm md:text-lg">@coffee_house_hiro</span>
										</div>
									)}
								</div>
							))}
						</a>

						<div className="mt-12 md:mt-16 text-center">
							<a
								href={INSTAGRAM_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex w-full sm:w-auto justify-center items-center gap-3 px-8 py-4 md:px-10 md:py-5 border border-paper/40 hover:border-paper hover:bg-paper hover:text-espresso text-paper tracking-wider md:text-lg transition-colors"
							>
								<Instagram className="w-5 h-5" />
								Instagramをフォローする
							</a>
							<p className="mt-5 text-xs md:text-sm text-paper/60 tracking-wider">
								ご注文・お問い合わせは
								<a
									href={LINE_URL}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[#06C755] underline underline-offset-4"
								>
									LINE
								</a>
								から
							</p>
						</div>
					</motion.div>
				</section>

				{/* Menu */}
				<section id="menu" className="py-24 md:py-32 px-6 md:px-12 bg-[#EFECE5]">
					<div className="max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto relative">
						<div className="text-center mb-16 md:mb-20">
							<h2 className="font-serif text-4xl md:text-[44px] tracking-widest mb-3">商品一覧</h2>
							<p className="text-xs md:text-sm tracking-[0.2em] text-espresso/60 uppercase">Menu</p>
							<p className="text-xs md:text-base tracking-widest text-roast/75 mt-4">
								コーヒー豆・ドリップバッグを全国へ通販でお届けします。
								<br />
								{MENU_START_DATE}より価格・メニューを改定しました。
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
									className={`relative ${cat.limited ? "bg-paper border border-caramel/30 p-6 md:p-10 shadow-sm" : ""}`}
								>
									<div className="border-b border-espresso/20 pb-5 mb-8">
										<span className="block font-serif text-caramel text-sm md:text-lg tracking-widest mb-2">
											0{i + 1}
										</span>
										<h3 className="font-serif text-xl md:text-[32px] tracking-widest mb-1">
											{cat.title}
											{cat.limited && (
												<span className="ml-3 text-[11px] md:text-[13px] font-sans bg-caramel text-paper px-2 py-0.5 align-middle tracking-wider">
													LIMITED
												</span>
											)}
										</h3>
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1 sm:gap-4">
											{categoryNote(cat) && (
												<p className="text-xs md:text-base text-roast/70 font-sans tracking-wider">
													{categoryNote(cat)}
												</p>
											)}
											<span className="text-xs md:text-base tracking-wider text-roast/75 font-sans shrink-0">
												{categoryUnit(cat)}
											</span>
										</div>
									</div>

									<div className="space-y-5 md:space-y-7 font-serif text-lg md:text-2xl text-roast lg:px-6">
										{cat.items.map((item) => (
											<div key={item.name + item.sub} className="group">
												<div className="flex items-baseline justify-between">
													<span className="shrink-0 tracking-wider md:tracking-widest">
														{item.name}
													</span>
													<div className="flex-grow min-w-4 border-b border-dotted border-espresso/25 mx-2 md:mx-10"></div>
													<span className="tracking-wide md:tracking-widest text-base md:text-2xl font-medium tabular-nums whitespace-nowrap">
														{formatPrices(item.prices)}
													</span>
												</div>
												{itemSub(item) && (
													<p className="text-[13px] md:text-[17px] text-roast/80 tracking-wider mt-1">
														{itemSub(item)}
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
								<span className="inline-block">送料は全国一律、</span>
								<span className="inline-block">
									2アイテム分ごとに
									<span className="font-serif text-2xl md:text-[32px] mx-1 text-caramel font-medium">
										¥270
									</span>
								</span>
								<span className="inline-block">を頂戴いたします。</span>
							</p>
							<p className="text-center mt-6">
								<a
									href="#order-form"
									className="text-sm md:text-base text-caramel underline underline-offset-4 tracking-wider"
								>
									このメニューから注文メッセージを作る →
								</a>
							</p>
						</motion.div>
					</div>
				</section>

				{/* How to Order */}
				<section id="order" className="py-24 md:py-32 px-6 md:px-12 bg-espresso text-paper">
					<div className="max-w-4xl lg:max-w-5xl mx-auto">
						<div className="text-center mb-20">
							<h2 className="font-serif text-4xl md:text-[44px] tracking-widest mb-3">
								ご注文方法
							</h2>
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
									desc: "ご希望の商品名と数量をお知らせください。コーヒー豆は、豆か粉か、焙煎度もあわせてお知らせください。LINEをご利用でない方はメールでも承ります。",
								},
								{
									num: "II",
									title: "お支払いのご案内",
									desc: `折り返し、商品代金と送料の合計、およびお支払い先情報（${PAYMENTS.join("・")}）をご連絡します。`,
								},
								{
									num: "III",
									title: "焙煎と発送",
									desc: "ご入金を確認した後の週末に丁寧に焙煎し、新鮮なうちにお届け先へ発送いたします。",
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

						<OrderBuilder />

						<div className="mt-20 bg-[#241A16] p-6 md:p-16 text-center relative overflow-hidden">
							<div className="absolute -inset-1 border-[0.5px] border-paper/5 m-4 pointer-events-none"></div>
							<MessageCircle className="w-6 h-6 text-[#06C755] mx-auto mb-6" />
							<p className="font-sans text-sm md:text-lg tracking-widest text-paper/70 mb-8">
								商品のご相談・お問い合わせはLINEへ
							</p>
							<a
								href={LINE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex w-full sm:w-auto justify-center items-center gap-3 px-6 md:px-12 py-4 md:py-5 whitespace-nowrap tracking-wider md:tracking-widest text-base md:text-xl font-bold bg-[#06C755] hover:bg-[#05b14c] text-white shadow-lg shadow-[#06C755]/20 transition-colors"
							>
								<MessageCircle className="w-5 h-5" />
								LINEでご相談・お問い合わせ
							</a>
							<div className="mt-12 pt-8 border-t border-paper/10">
								<p className="text-xs md:text-base text-paper/65 tracking-widest mb-3">
									LINEをご利用でない方は、メールでも承ります
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
			</main>
			{/* Footer / Access */}
			<footer id="access" className="bg-[#120D0B] text-paper pt-20 pb-12 px-6 md:px-12">
				<div className="max-w-5xl mx-auto">
					<div className="grid md:grid-cols-2 gap-14 md:gap-8 mb-20">
						<div>
							<h2 className="font-serif text-lg md:text-xl tracking-widest mb-6 text-paper/90">
								コーヒーhouseヒロ
							</h2>
							<address className="not-italic space-y-2 text-[13px] md:text-base text-paper/70 tracking-widest font-light mb-4">
								<p>〒{POSTAL}</p>
								<p>{ADDRESS}</p>
							</address>
							<a
								href={MAP_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${ADDRESS} をGoogleマップで開く（新しいタブ）`}
								className="flex w-fit items-center gap-3 mb-10 text-paper/75 hover:text-paper transition-colors tracking-widest text-[13px] md:text-base underline underline-offset-4 decoration-paper/30 hover:decoration-paper/70"
							>
								<MapPin className="w-4 h-4" />
								<span>Googleマップで開く</span>
							</a>

							<a
								href={INSTAGRAM_URL}
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
								<span>LINE公式アカウント</span>
							</a>
						</div>

						<div className="font-serif leading-loose space-y-10 pr-4">
							<div>
								<h3 className="text-xs md:text-sm font-sans tracking-[0.3em] text-caramel mb-4 uppercase">
									Business Hours
								</h3>
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
								<h3 className="text-xs md:text-sm font-sans tracking-[0.3em] text-caramel mb-4 uppercase">
									Visit Details
								</h3>
								<p className="text-[13px] md:text-[17px] tracking-wide text-paper/80 leading-[1.9] text-pretty">
									ご来店は1組4名様までの完全予約制です。
									<br />
									ご来店を希望される場合は、事前にInstagramなどのメッセージでご連絡ください。赤い小屋で、実際にコーヒーをお召し上がりいただけます。
								</p>
							</div>
						</div>
					</div>

					<nav
						aria-label="ページ内リンク"
						className="flex justify-center gap-6 md:gap-10 mb-8 text-xs md:text-sm tracking-[0.2em] text-paper/60 uppercase"
					>
						<a href="#about" className="hover:text-paper transition-colors">
							Concept
						</a>
						<a href="#menu" className="hover:text-paper transition-colors">
							Menu
						</a>
						<a href="#order" className="hover:text-paper transition-colors">
							Order
						</a>
						<a href="#access" className="hover:text-paper transition-colors">
							Access
						</a>
					</nav>
					<div
						suppressHydrationWarning
						className="text-center font-sans tracking-[0.3em] text-[11px] md:text-[13px] text-paper/40 border-t border-white/5 pt-10"
					>
						&copy; {new Date().getFullYear()} コーヒーhouseヒロ
					</div>
				</div>
			</footer>
		</div>
	);
}
