import { SHOP_NAME } from "../content/shop.ts";
import { NAV_LINKS } from "../content/site.ts";
import { Changelog } from "./Changelog.tsx";

/** ページ上部。更新履歴の帯と、その下のナビゲーション(PC ではページ内リンク)。注文ボタンは画面下の OrderBar に出す */
export function SiteHeader() {
	return (
		<header className="relative">
			<Changelog />
			<nav className="absolute top-full w-full z-50 py-5 px-6 md:px-12 flex justify-between items-center text-paper">
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
			</nav>
		</header>
	);
}
