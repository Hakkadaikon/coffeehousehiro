import { MapPin, MessageCircle } from "lucide-react";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { InstagramIcon } from "../components/InstagramIcon.tsx";
import { ADDRESS, INSTAGRAM_URL, LINE_URL, MAP_URL, POSTAL } from "../content/shop.ts";
import { NAV_LINKS } from "../content/site.ts";

/** フッター。住所と地図・SNS、営業時間、来店案内、ページ内リンク */
export function SiteFooter() {
	return (
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
						<ExternalLink
							href={MAP_URL}
							aria-label={`${ADDRESS} をGoogleマップで開く（新しいタブ）`}
							className="flex w-fit items-center gap-3 mb-10 text-paper/75 hover:text-paper transition-colors tracking-widest text-[13px] md:text-base underline underline-offset-4 decoration-paper/30 hover:decoration-paper/70"
						>
							<MapPin className="w-4 h-4" />
							<span>Googleマップで開く</span>
						</ExternalLink>

						<ExternalLink
							href={INSTAGRAM_URL}
							className="inline-flex items-center gap-3 text-paper/75 hover:text-paper transition-colors tracking-widest text-[13px] md:text-base"
						>
							<InstagramIcon className="w-4 h-4" />
							<span>@coffee_house_hiro</span>
						</ExternalLink>
						<ExternalLink
							href={LINE_URL}
							className="flex items-center gap-3 mt-3 text-[#06C755]/80 hover:text-[#06C755] transition-colors tracking-widest text-[13px] md:text-base"
						>
							<MessageCircle className="w-4 h-4" />
							<span>LINE公式アカウント</span>
						</ExternalLink>
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
					{NAV_LINKS.map((l) => (
						<a key={l.href} href={l.href} className="hover:text-paper transition-colors">
							{l.label}
						</a>
					))}
				</nav>
				<div
					suppressHydrationWarning
					className="text-center font-sans tracking-[0.3em] text-[11px] md:text-[13px] text-paper/40 border-t border-white/5 pt-10"
				>
					&copy; {new Date().getFullYear()} コーヒーhouseヒロ
				</div>
			</div>
		</footer>
	);
}
