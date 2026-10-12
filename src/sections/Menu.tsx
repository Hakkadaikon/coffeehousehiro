import { motion } from "motion/react";
import { fadeIn, staggerContainer } from "../components/motion.ts";
import {
	categoryNote,
	categoryUnit,
	itemSub,
	MENU,
	MENU_START_DATE,
	type MenuCategory,
	type MenuItem,
} from "../content/menu.ts";
import { formatPrices, SHIPPING_EXAMPLE, SHIPPING_YEN, yen } from "../order/pricing.ts";

/** 商品一覧。カテゴリと価格は content/menu.ts から作る */
export function Menu() {
	return (
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
						<MenuCategoryBlock key={cat.title} category={cat} number={i + 1} />
					))}
				</motion.div>
				<motion.div variants={fadeIn} className="mt-16 pt-10 border-t border-espresso/15">
					<p className="text-sm md:text-lg font-sans tracking-widest text-roast/80 text-center">
						<span className="inline-block">送料は全国一律、</span>
						<span className="inline-block">
							2アイテム分ごとに
							<span className="font-serif text-2xl md:text-[32px] mx-1 text-caramel font-medium">
								{yen(SHIPPING_YEN)}
							</span>
						</span>
						<span className="inline-block">を頂戴いたします。</span>
					</p>
					<p className="text-xs md:text-sm font-sans tracking-wider text-roast/80 text-center mt-3 text-pretty">
						<span className="inline-block">{`（${SHIPPING_EXAMPLE}）`}</span>
						<span className="inline-block">価格はすべて税込です。</span>
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
	);
}

/** 1カテゴリ分。番号・カテゴリ名・注記・単位の見出しと、品目の一覧。限定品は枠で囲む */
function MenuCategoryBlock({ category: cat, number }: { category: MenuCategory; number: number }) {
	const note = categoryNote(cat);
	return (
		<motion.div
			variants={fadeIn}
			className={`relative ${cat.limited ? "bg-paper border border-caramel/30 p-6 md:p-10 shadow-sm" : ""}`}
		>
			<div className="border-b border-espresso/20 pb-5 mb-8">
				<span className="block font-serif text-caramel text-sm md:text-lg tracking-widest mb-2">
					0{number}
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
					{note && (
						<p className="text-xs md:text-base text-roast/70 font-sans tracking-wider">{note}</p>
					)}
					<span className="text-xs md:text-base tracking-wider text-roast/75 font-sans shrink-0">
						{categoryUnit(cat)}
					</span>
				</div>
			</div>

			<div className="space-y-5 md:space-y-7 font-serif text-lg md:text-2xl text-roast lg:px-6">
				{cat.items.map((item) => (
					<MenuItemRow key={item.name + item.sub} item={item} />
				))}
			</div>
		</motion.div>
	);
}

/** 品目1行。品名と価格を点線でつなぎ、補足があれば下に出す */
function MenuItemRow({ item }: { item: MenuItem }) {
	const sub = itemSub(item);
	return (
		<div className="group">
			<div className="flex items-baseline justify-between">
				<span className="shrink-0 tracking-wider md:tracking-widest">{item.name}</span>
				<div className="flex-grow min-w-4 border-b border-dotted border-espresso/25 mx-2 md:mx-10"></div>
				<span className="tracking-wide md:tracking-widest text-base md:text-2xl font-medium tabular-nums whitespace-nowrap">
					{formatPrices(item.prices)}
				</span>
			</div>
			{sub && <p className="text-[13px] md:text-[17px] text-roast/80 tracking-wider mt-1">{sub}</p>}
		</div>
	);
}
