import { motion } from "motion/react";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { InstagramIcon } from "../components/InstagramIcon.tsx";
import { fadeIn } from "../components/motion.ts";
import { INSTAGRAM_TILES, type Photo } from "../content/photos.ts";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, LINE_URL } from "../content/shop.ts";

/** 営業日とお知らせは Instagram で。写真を並べてアカウントへ誘導する */
export function InstagramFeed() {
	return (
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

				<ExternalLink
					href={INSTAGRAM_URL}
					aria-label={`Instagramで${INSTAGRAM_HANDLE}の投稿を見る（新しいタブで開きます）`}
					className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2"
				>
					{INSTAGRAM_TILES.map((img, i) => (
						<InstagramTile key={img.src} photo={img} index={i} />
					))}
				</ExternalLink>

				<div className="mt-12 md:mt-16 text-center">
					<ExternalLink
						href={INSTAGRAM_URL}
						className="inline-flex w-full sm:w-auto justify-center items-center gap-3 px-8 py-4 md:px-10 md:py-5 border border-paper/40 hover:border-paper hover:bg-paper hover:text-espresso text-paper tracking-wider md:text-lg transition-colors"
					>
						<InstagramIcon className="w-5 h-5" />
						Instagramをフォローする
					</ExternalLink>
					<p className="mt-5 text-xs md:text-sm text-paper/60 tracking-wider">
						ご注文・お問い合わせは
						<ExternalLink href={LINE_URL} className="text-[#06C755] underline underline-offset-4">
							LINE
						</ExternalLink>
						から
					</p>
				</div>
			</motion.div>
		</section>
	);
}

/** 写真1枚のタイル。先頭(index 0)は大きく出してアカウント名を重ね、6枚目以降はスマホでは隠す */
function InstagramTile({ photo, index }: { photo: Photo; index: number }) {
	return (
		<div
			className={`group/tile relative overflow-hidden bg-roast ${
				index === 0 ? "col-span-2 aspect-square md:row-span-2 md:aspect-auto" : "aspect-square"
			} ${index >= 5 ? "hidden md:block" : ""}`}
		>
			<img
				src={photo.src}
				alt={photo.alt}
				width={photo.w}
				height={photo.h}
				loading="lazy"
				decoding="async"
				className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover/tile:scale-105"
			/>
			<div className="absolute inset-0 bg-espresso/0 group-hover/tile:bg-espresso/45 transition-colors duration-500 flex items-center justify-center">
				<InstagramIcon className="w-7 h-7 text-paper opacity-0 group-hover/tile:opacity-100 transition-opacity duration-500" />
			</div>
			{index === 0 && (
				<div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-espresso/85 to-transparent flex items-center gap-3">
					<InstagramIcon className="w-5 h-5 md:w-6 md:h-6" />
					<span className="tracking-widest text-sm md:text-lg">{INSTAGRAM_HANDLE}</span>
				</div>
			)}
		</div>
	);
}
