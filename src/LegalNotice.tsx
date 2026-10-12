import { LEGAL_NOTICE, SHOP_NAME } from "./content/shop.ts";

/** 特定商取引法に基づく表記のページ。ビルド時に HTML へ書き出すだけで、JavaScript は読み込まない */
export default function LegalNotice() {
	return (
		<div className="min-h-screen bg-paper text-espresso font-sans">
			<header className="py-5 px-6 md:px-12">
				<a href="/" className="font-serif text-base md:text-2xl tracking-[0.15em]">
					{SHOP_NAME}
				</a>
			</header>
			<main className="max-w-3xl mx-auto px-6 md:px-12 pt-10 pb-24">
				<h1 className="font-serif text-2xl md:text-4xl tracking-widest mb-12">
					特定商取引法に基づく表記
				</h1>
				<dl className="border-t border-espresso/15 text-sm md:text-base leading-[1.9] tracking-wide">
					{LEGAL_NOTICE.map((r) => (
						<div
							key={r.label}
							className="grid md:grid-cols-[13rem_1fr] gap-1 md:gap-6 py-5 border-b border-espresso/15"
						>
							<dt className="font-medium text-roast">{r.label}</dt>
							<dd className="text-pretty">
								{r.lines.map((line) => (
									<p key={line}>{line}</p>
								))}
							</dd>
						</div>
					))}
				</dl>
				<p className="mt-12">
					<a href="/" className="text-caramel underline underline-offset-4 tracking-wider">
						← トップページへ戻る
					</a>
				</p>
			</main>
		</div>
	);
}
