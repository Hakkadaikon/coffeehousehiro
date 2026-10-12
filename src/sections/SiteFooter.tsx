import { ChevronDown, MapPin, MessageCircle } from "lucide-react";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { GitHubIcon } from "../components/GitHubIcon.tsx";
import { InstagramIcon } from "../components/InstagramIcon.tsx";
import {
	ADDRESS,
	INSTAGRAM_HANDLE,
	INSTAGRAM_URL,
	LINE_URL,
	MAP_URL,
	POSTAL,
	SHOP_NAME,
} from "../content/shop.ts";
import { NAV_LINKS, SITE_DATA_POLICY, SOURCE_CODE_URL } from "../content/site.ts";

/** フッター。住所と地図・SNS、営業時間、来店案内、情報の取り扱い、ページ内リンク、特定商取引法に基づく表記・プライバシーポリシーへのリンク */
const legalLink =
	"font-sans text-xs md:text-sm tracking-[0.2em] text-paper/60 hover:text-paper transition-colors underline underline-offset-4 decoration-paper/30";

export function SiteFooter() {
	return (
		<footer id="access" className="bg-[#120D0B] text-paper pt-20 pb-12 px-6 md:px-12">
			<div className="max-w-5xl mx-auto">
				<div className="grid md:grid-cols-2 gap-14 md:gap-8 mb-20">
					<ShopContact />

					<ShopHours />
				</div>

				<DataPolicy />

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
				<p className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
					<a href="/legal" className={legalLink}>
						特定商取引法に基づく表記
					</a>
					<a href="/legal#privacy" className={legalLink}>
						プライバシーポリシー
					</a>
				</p>
				<div
					suppressHydrationWarning
					className="text-center font-sans tracking-[0.3em] text-[11px] md:text-[13px] text-paper/40 border-t border-white/5 pt-10"
				>
					&copy; {new Date().getFullYear()} {SHOP_NAME}
				</div>
			</div>
		</footer>
	);
}

/** 店名・住所と地図、SNS、このサイトのソースコード */
function ShopContact() {
	return (
		<div>
			<h2 className="font-serif text-lg md:text-xl tracking-widest mb-6 text-paper/90">
				{SHOP_NAME}
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
				<span>{INSTAGRAM_HANDLE}</span>
			</ExternalLink>
			<ExternalLink
				href={LINE_URL}
				className="flex items-center gap-3 mt-3 text-[#06C755]/80 hover:text-[#06C755] transition-colors tracking-widest text-[13px] md:text-base"
			>
				<MessageCircle className="w-4 h-4" />
				<span>LINE公式アカウント</span>
			</ExternalLink>
			<ExternalLink
				href={SOURCE_CODE_URL}
				className="flex items-center gap-3 mt-3 text-paper/75 hover:text-paper transition-colors tracking-widest text-[13px] md:text-base"
			>
				<GitHubIcon className="w-4 h-4" />
				<span>このサイトのソースコード（GitHub）</span>
			</ExternalLink>
		</div>
	);
}

/** 営業時間と来店の案内 */
function ShopHours() {
	return (
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
	);
}

/** このサイトでの情報の取り扱い。普段は閉じておき、見出しを押すと開く */
function DataPolicy() {
	const label = "block mb-1 font-sans text-xs md:text-sm tracking-[0.2em] text-paper/60";
	return (
		<details className="group mb-16 border-t border-white/5 pt-10">
			<summary className="flex w-fit cursor-pointer list-none items-center gap-3 py-3 -my-3 font-sans text-xs md:text-sm tracking-[0.2em] text-caramel hover:text-paper transition-colors [&::-webkit-details-marker]:hidden">
				このサイトでの情報の取り扱い
				<ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
			</summary>
			<div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-12 text-[13px] md:text-[17px] text-paper/80 leading-[1.9] tracking-wide text-pretty">
				{SITE_DATA_POLICY.map((p) => (
					<p key={p.label}>
						<span className={label}>{p.label}</span>
						{p.text}
					</p>
				))}
			</div>
		</details>
	);
}
