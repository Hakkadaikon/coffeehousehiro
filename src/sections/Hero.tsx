import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { fadeIn } from "../components/motion.ts";
import { HERO } from "../content/photos.ts";
import { LINE_URL } from "../content/shop.ts";

/** ファーストビュー。キャッチコピー、LINE の注文・問い合わせボタン、ロゴ(h1) */
export function Hero() {
	return (
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
						<p className="font-serif text-[clamp(26px,3.5vw,52px)] leading-[1.8] mb-8 tracking-wider">
							<span className="block whitespace-nowrap">平日はサラリーマン、</span>
							<span className="block whitespace-nowrap text-paper/70">週末はロースター。</span>
						</p>
						<p className="text-paper/80 tracking-[0.2em] font-light text-sm md:text-xl border-l-2 border-caramel pl-4 py-1">
							スペシャルティコーヒーの舞台へ
						</p>
						<ExternalLink
							href={LINE_URL}
							className="mt-10 inline-flex w-full sm:w-auto justify-center items-center gap-3 px-8 py-4 md:text-xl md:px-10 md:py-5 bg-[#06C755] hover:bg-[#05b14c] text-white font-medium tracking-wider shadow-lg shadow-black/30 transition-colors"
						>
							<MessageCircle className="w-5 h-5" />
							<span className="text-center">
								LINEで<span className="inline-block">注文・お問い合わせ</span>
							</span>
						</ExternalLink>
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
	);
}
