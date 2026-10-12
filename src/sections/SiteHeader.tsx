import { MessageCircle } from "lucide-react";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { LINE_URL, SHOP_NAME } from "../content/shop.ts";
import { NAV_LINKS } from "../content/site.ts";

/** ページ上部のナビゲーション。PC ではページ内リンク、常に LINE 注文ボタンを出す */
export function SiteHeader() {
	return (
		<header>
			<nav className="absolute top-0 w-full z-50 py-5 px-6 md:px-12 flex justify-between items-center text-paper">
				<div className="font-serif text-base md:text-2xl tracking-[0.15em] flex items-center gap-3">
					{SHOP_NAME}
				</div>
				<div className="hidden md:flex gap-10 md:text-base lg:text-lg font-medium tracking-[0.15em] uppercase">
					{NAV_LINKS.map((l) => (
						<a key={l.href} href={l.href} className="hover:text-caramel transition-colors">
							{l.label}
						</a>
					))}
				</div>
				<ExternalLink
					href={LINE_URL}
					className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755] hover:bg-[#05b14c] text-white text-xs md:text-base md:px-5 md:py-2.5 font-medium tracking-wider transition-colors"
				>
					<MessageCircle className="w-4 h-4" />
					LINE注文
				</ExternalLink>
			</nav>
		</header>
	);
}
