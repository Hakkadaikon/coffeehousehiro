import { motion } from "motion/react";
import { fadeIn } from "../components/motion.ts";
import { CONCEPT } from "../content/photos.ts";

/** お店のこだわりと店主の紹介 */
export function Concept() {
	return (
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
	);
}
