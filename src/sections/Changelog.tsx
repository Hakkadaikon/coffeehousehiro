import { ChevronDown } from "lucide-react";
import { CHANGELOG } from "../content/changelog.ts";

const isoDate = (date: string) => date.replaceAll("/", "-");

/** ページ最上部の更新履歴の帯。閉じているときは最新の1件だけ、開くと全件を新しい順に出す */
export function Changelog() {
	const [latest] = CHANGELOG;
	return (
		<details className="group bg-espresso text-paper/70 border-b border-white/5">
			<summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 px-6 md:px-12 text-xs md:text-sm tracking-wider hover:text-paper transition-colors [&::-webkit-details-marker]:hidden">
				<span className="shrink-0 text-paper/60">更新履歴</span>
				<time dateTime={isoDate(latest.date)} className="shrink-0 tabular-nums text-paper/90">
					{latest.date}
				</time>
				<span className="min-w-0 truncate">{latest.items[0]}</span>
				{latest.items.length > 1 && (
					<span className="hidden md:inline shrink-0 text-paper/60">
						ほか{latest.items.length - 1}件
					</span>
				)}
				<ChevronDown
					aria-hidden
					className="ml-auto w-4 h-4 shrink-0 transition-transform group-open:rotate-180"
				/>
			</summary>
			<section
				aria-label="サイトの更新履歴"
				// biome-ignore lint/a11y/noNoninteractiveTabindex: スクロールする領域をキーボードで動かせるようにする
				tabIndex={0}
				className="max-h-[min(20rem,45vh)] overflow-y-auto overscroll-contain px-6 md:px-12 pb-6 pt-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-paper/40"
			>
				<ol className="max-w-3xl space-y-5 text-[13px] md:text-[15px] leading-[1.9] tracking-wide">
					{CHANGELOG.map((e) => (
						<li key={e.date} className="md:grid md:grid-cols-[7rem_1fr] md:gap-6">
							<time
								dateTime={isoDate(e.date)}
								className="block mb-1 md:mb-0 tabular-nums text-paper/90"
							>
								{e.date}
							</time>
							<ul className="text-paper/75 text-pretty">
								{e.items.map((t) => (
									<li key={t}>{t}</li>
								))}
							</ul>
						</li>
					))}
				</ol>
			</section>
		</details>
	);
}
