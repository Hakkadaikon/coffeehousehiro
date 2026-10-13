import type { ReactNode } from "react";
import type { PolicyItem } from "../content/site.ts";

/**
 * 2行以上は黒丸付きの箇条書きにする。1行だけのときと、住所や連絡先(〒・URL・メールアドレス)を含むときは、
 * 1行ずつ段落のまま並べる
 */
export function PolicyLines({
	lines,
	render = (text) => text,
}: {
	lines: string[];
	render?: (text: string, i: number) => ReactNode;
}) {
	if (lines.length === 1 || lines.some((l) => /〒|https?:\/\/|@/.test(l)))
		return lines.map((text, i) => <p key={text}>{render(text, i)}</p>);
	return (
		<ul className="space-y-1.5">
			{lines.map((text, i) => (
				<li
					key={text}
					className="relative pl-4 before:absolute before:left-0 before:top-[0.8em] before:size-1.5 before:rounded-full before:bg-caramel"
				>
					{render(text, i)}
				</li>
			))}
		</ul>
	);
}

/** 小見出しごとの箇条書き */
export function PolicySections({ sections }: { sections: PolicyItem["sections"] }) {
	return sections?.map((s) => (
		<div key={s.title} className="mt-4">
			<p className="mb-1 font-medium text-paper/90">{s.title}</p>
			<PolicyLines lines={s.lines} />
		</div>
	));
}
