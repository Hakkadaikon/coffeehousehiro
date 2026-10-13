import { ExternalLink } from "./components/ExternalLink.tsx";
import { PolicyLines, PolicySections } from "./components/PolicyLines.tsx";
import { LEGAL_NOTICE, PRIVACY_POLICY, SHOP_NAME } from "./content/shop.ts";
import { type PolicyItem, SITE_DATA_POLICY } from "./content/site.ts";

type Row = (typeof LEGAL_NOTICE)[number] & { sections?: PolicyItem["sections"] };

// プライバシーポリシーには、フッターと同じ「このサイトでの情報の取り扱い」を制定日の前に入れる
const SITE_ROWS: Row[] = SITE_DATA_POLICY.map((p) => ({
	label: p.label,
	lines: p.lines.map((text) => ({ text, strong: false })),
	sections: p.sections,
}));
const isDate = (r: Row) => r.label === "制定日";
const PRIVACY_ROWS = [
	...PRIVACY_POLICY.filter((r) => !isDate(r)),
	...SITE_ROWS,
	...PRIVACY_POLICY.filter(isDate),
];

/** 特定商取引法に基づく表記とプライバシーポリシーのページ。ビルド時に HTML へ書き出すだけで、JavaScript は読み込まない */
export default function LegalNotice() {
	const h2 = "font-serif text-2xl md:text-4xl tracking-widest mb-12 text-paper/80";
	return (
		<div className="min-h-screen bg-[#120D0B] text-paper/70 font-sans">
			<header className="py-5 px-6 md:px-12">
				<a
					href="/"
					className="font-serif text-base md:text-2xl tracking-[0.15em] text-paper/80 hover:text-paper transition-colors"
				>
					{SHOP_NAME}
				</a>
			</header>
			<main className="max-w-6xl mx-auto px-6 md:px-12 pt-10 pb-24">
				<h1 className="sr-only">特定商取引法に基づく表記・プライバシーポリシー</h1>
				<section id="tokushoho" aria-labelledby="tokushoho-title">
					<h2 id="tokushoho-title" className={h2}>
						特定商取引法に基づく表記
					</h2>
					<Table rows={LEGAL_NOTICE} />
				</section>
				<section id="privacy" aria-labelledby="privacy-title" className="mt-24 scroll-mt-8">
					<h2 id="privacy-title" className={h2}>
						プライバシーポリシー
					</h2>
					<Table rows={PRIVACY_ROWS} />
				</section>
				<p className="mt-12">
					<a
						href="/"
						className="text-paper/75 hover:text-paper transition-colors underline underline-offset-4 decoration-paper/30 hover:decoration-paper/70 tracking-wider"
					>
						← トップページへ戻る
					</a>
				</p>
			</main>
		</div>
	);
}

/** 項目名と本文の表。2行以上は箇条書きにし、「strong:」の行は強調し、URL だけの行はリンクにする */
function Table({ rows }: { rows: Row[] }) {
	return (
		<dl className="border-t border-white/10 text-sm md:text-base lg:text-[17px] leading-[1.9] tracking-wide">
			{rows.map((r) => (
				<div
					key={r.label}
					className="grid md:grid-cols-[13rem_1fr] lg:grid-cols-[16rem_1fr] gap-1 md:gap-6 lg:gap-10 py-5 lg:py-6 border-b border-white/10"
				>
					<dt className="font-medium text-paper/50">{r.label}</dt>
					<dd className="text-pretty">
						<PolicyLines
							lines={r.lines.map((l) => l.text)}
							render={(text, i) =>
								r.lines[i].strong ? (
									<strong className="font-medium text-paper">{text}</strong>
								) : /^https?:\/\//.test(text) ? (
									<ExternalLink
										href={text}
										className="underline underline-offset-4 decoration-paper/30 hover:text-paper hover:decoration-paper/70 transition-colors break-all"
									>
										{text}
									</ExternalLink>
								) : (
									text
								)
							}
						/>
						<PolicySections sections={r.sections} />
					</dd>
				</div>
			))}
		</dl>
	);
}
