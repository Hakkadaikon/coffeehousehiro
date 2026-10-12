import { motion } from "motion/react";
import { fadeIn } from "../components/motion.ts";
import { CERTIFICATE, CONCEPT } from "../content/photos.ts";

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
					<h2 className="font-serif text-2xl sm:text-3xl md:text-[44px] mb-10 md:mb-14 text-center tracking-wider md:tracking-widest leading-loose">
						<span className="inline-block">こだわりの一杯を、</span>
						<span className="inline-block">手作りの赤い小屋から。</span>
					</h2>
					<div className="-mx-6 sm:mx-0 overflow-hidden group">
						<img
							src={CONCEPT.src}
							alt="倉敷市福田町にある手作りの赤い小屋の外観"
							width={CONCEPT.w}
							height={CONCEPT.h}
							loading="lazy"
							decoding="async"
							className="w-full aspect-[4/3] md:aspect-[16/9] object-cover object-[50%_55%] motion-safe:group-hover:scale-105 transition-transform duration-1000 ease-out"
						/>
					</div>
					<div className="max-w-2xl mx-auto mt-12 md:mt-16 space-y-7 font-serif leading-[2] text-roast tracking-wide text-pretty">
						<p className="text-base md:text-lg lg:text-xl">
							コーヒーhouseヒロの店主は、月曜日から金曜日はごく普通のサラリーマン。しかし土日・祝日になると、岡山県倉敷市の小さな赤い小屋で、情熱を持ったロースターへと姿を変えます。
						</p>
						<p className="text-base md:text-lg lg:text-xl">
							ブラックコーヒーとアイスコーヒーを専門に扱っており、豆本来の個性を引き出す焙煎を丹念に行っています。
						</p>
					</div>
					<div className="max-w-3xl mx-auto mt-16 md:mt-20 pt-10 md:pt-12 border-t border-espresso/10 grid md:grid-cols-2 gap-6 md:gap-10 items-center">
						<div className="space-y-3">
							<p className="text-xs md:text-sm tracking-widest uppercase text-caramel font-sans">
								Qualification
							</p>
							<p className="font-serif text-base md:text-lg tracking-widest leading-relaxed text-roast">
								<span className="inline-block">J.C.Q.A.認定</span>
								<span className="inline-block">コーヒーインストラクター2級</span>
							</p>
							<p className="font-sans text-sm md:text-base text-roast/75 tracking-wider leading-relaxed">
								<span className="inline-block">たしかな知識と技術で、</span>
								<span className="inline-block">最高の一杯をお届けします。</span>
							</p>
						</div>
						<img
							src={CERTIFICATE.src}
							alt={CERTIFICATE.alt}
							width={CERTIFICATE.w}
							height={CERTIFICATE.h}
							loading="lazy"
							decoding="async"
							className="w-full h-auto shadow-sm"
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
