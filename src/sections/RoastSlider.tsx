import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { fadeIn } from "../components/motion.ts";
import { ROAST_LEVELS, roastAt, type Taste } from "../content/roast.ts";

const TASTES: [keyof Taste, string][] = [
	["acidity", "酸味"],
	["bitterness", "苦味"],
	["body", "コク"],
];

/** 焙煎度スライダー。動かすと豆の色と味の説明が変わる */
export function RoastSlider() {
	const [pos, setPos] = useState(50);
	const { level, color, taste } = roastAt(pos);
	return (
		<section
			id="roast"
			className="py-24 md:py-32 px-6 md:px-12 bg-paper border-t border-espresso/10"
		>
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={fadeIn}
				className="max-w-3xl md:max-w-4xl mx-auto"
			>
				<div className="text-center mb-16 md:mb-20">
					<h2 className="font-serif text-4xl md:text-[44px] tracking-widest mb-3">
						焙煎度で変わる味
					</h2>
					<p className="text-xs md:text-sm tracking-[0.2em] text-espresso/60 uppercase">Roast</p>
					<p className="text-xs md:text-base tracking-widest text-roast/75 mt-4 text-pretty">
						<span className="inline-block">つまみを動かすと、</span>
						<span className="inline-block">焙煎度による豆の色と味わいの違いを</span>
						<span className="inline-block">ご覧いただけます。</span>
					</p>
				</div>

				<div className="grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-14 items-center">
					<div className="flex flex-col items-center">
						<Bean color={color} oil={Math.max(0, (pos - 75) / 25)} />
						<div className="w-full mt-8">
							<input
								type="range"
								min={0}
								max={100}
								value={pos}
								onChange={(e) => setPos(Number(e.target.value))}
								aria-label="焙煎度"
								aria-valuetext={level.name}
								className="w-full h-8 accent-caramel cursor-pointer rounded-full focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel"
							/>
							<div className="grid grid-cols-3 text-xs md:text-sm text-roast/70 tracking-wider">
								{ROAST_LEVELS.map((l, i) => (
									<button
										key={l.name}
										type="button"
										onClick={() => setPos((i / (ROAST_LEVELS.length - 1)) * 100)}
										className={`${["text-left", "text-center", "text-right"][i]} py-3.5 -my-3.5 hover:text-caramel transition-colors focus-visible:outline-2 focus-visible:outline-caramel outline-offset-2 ${l === level ? "text-caramel font-medium" : ""}`}
									>
										{l.name}
									</button>
								))}
							</div>
						</div>
					</div>

					<div>
						<div aria-live="polite">
							<AnimatePresence mode="wait" initial={false}>
								<motion.div
									key={level.name}
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									transition={{ duration: 0.25 }}
								>
									<h3 className="font-serif text-2xl md:text-[32px] tracking-widest">
										{level.name}
									</h3>
									<p className="text-sm md:text-base text-roast leading-[1.9] tracking-wide mt-4 text-pretty">
										{level.about}
									</p>
									<dl className="text-sm md:text-base text-roast/85 tracking-wide mt-4 space-y-1">
										<div className="flex gap-3">
											<dt className="shrink-0 text-roast/60">香り</dt>
											<dd>{level.aroma}</dd>
										</div>
										<div className="flex gap-3">
											<dt className="shrink-0 text-roast/60">飲み方</dt>
											<dd>{level.drink}</dd>
										</div>
									</dl>
								</motion.div>
							</AnimatePresence>
						</div>

						<dl className="mt-6 space-y-2">
							{TASTES.map(([key, label]) => (
								<div key={key} className="grid grid-cols-[3rem_1fr] items-center gap-3">
									<dt className="text-sm text-roast/70 tracking-wider">{label}</dt>
									<dd className="h-1.5 bg-espresso/10 rounded-full overflow-hidden">
										<span className="sr-only">{`5段階中${Math.round(taste[key])}`}</span>
										<div
											className="h-full bg-caramel rounded-full transition-[width] duration-300 motion-reduce:transition-none"
											style={{ width: `${(taste[key] / 5) * 100}%` }}
										/>
									</dd>
								</div>
							))}
							<div className="grid grid-cols-[3rem_1fr] gap-3 text-[10px] md:text-xs text-roast/50 tracking-wider">
								<span />
								<span className="flex justify-between">
									<span>控えめ</span>
									<span>しっかり</span>
								</span>
							</div>
						</dl>
					</div>
				</div>

				<p className="text-center mt-12 text-xs md:text-sm text-roast/70 tracking-wider text-pretty">
					焙煎度は、かんたん注文フォームで豆ごとに選べます。迷ったら「おまかせ」で。
				</p>
				<p className="text-center mt-4">
					<a
						href="#order-form"
						className="text-sm md:text-base text-caramel underline underline-offset-4 tracking-wider"
					>
						焙煎度を選んで注文メッセージを作る →
					</a>
				</p>
			</motion.div>
		</section>
	);
}

/** コーヒー豆の絵。深く煎るほど色が濃くなる。油のつや(oil: 0〜1)は中深煎りの近くでだけうっすら出る */
function Bean({ color, oil }: { color: string; oil: number }) {
	return (
		<svg
			viewBox="0 0 200 260"
			className="w-40 md:w-56 drop-shadow-xl motion-reduce:[&_*]:transition-none"
			aria-hidden="true"
		>
			<defs>
				<radialGradient id="bean-shine" cx="35%" cy="28%" r="45%">
					<stop offset="0%" stopColor="#fff" stopOpacity={0.1 + oil * 0.2} />
					<stop offset="100%" stopColor="#fff" stopOpacity={0} />
				</radialGradient>
			</defs>
			<g transform="rotate(-18 100 130)">
				<ellipse
					cx="100"
					cy="130"
					rx="78"
					ry="110"
					style={{ fill: color, transition: "fill .3s" }}
				/>
				<ellipse cx="100" cy="130" rx="78" ry="110" fill="url(#bean-shine)" />
				<path
					d="M100 30 C 70 82, 132 150, 98 230"
					fill="none"
					stroke="#000"
					strokeOpacity={0.35}
					strokeWidth="7"
					strokeLinecap="round"
				/>
			</g>
		</svg>
	);
}
