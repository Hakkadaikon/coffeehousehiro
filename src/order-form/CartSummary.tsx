import type { CartLine } from "../order/cart.ts";
import {
	itemsTotal,
	SHIPPING_EXAMPLE,
	SHIPPING_YEN,
	shippingFee,
	subtotal,
	total,
	yen,
} from "../order/pricing.ts";
import { headingCls, Stepper } from "./controls.tsx";

/** カートの中身と、小計・送料・合計 */
export function CartSummary({
	lines,
	onQtyChange,
	onRemove,
}: {
	lines: CartLine[];
	onQtyChange: (index: number, qty: number) => void;
	onRemove: (index: number) => void;
}) {
	const hasQuote = lines.some((l) => l.yen === null);
	return (
		<>
			<h4 className={headingCls}>カート</h4>
			{lines.length === 0 ? (
				<p className="text-sm text-roast/70 py-3 border-b border-espresso/10">
					カートに商品はまだありません
				</p>
			) : (
				<ul>
					{lines.map((l, idx) => {
						const s = subtotal(l);
						return (
							<li
								// biome-ignore lint/suspicious/noArrayIndexKey: 同じ商品を別の焙煎度で複数行入れられる。行に内部状態はない
								key={`${l.id}-${idx}`}
								className="flex items-start justify-between gap-3 py-3 border-b border-espresso/10"
							>
								<div className="font-serif text-sm md:text-base min-w-0">{l.label}</div>
								<div className="flex flex-col items-end gap-1.5 shrink-0">
									<Stepper small value={l.qty} onChange={(q) => onQtyChange(idx, q)} />
									<span className="tabular-nums text-sm">
										{s === null ? "時価・要相談" : yen(s)}
									</span>
									<button
										type="button"
										onClick={() => onRemove(idx)}
										className="py-2 px-1 -my-1 text-sm md:text-xs underline text-roast/70"
									>
										削除
									</button>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			<dl aria-live="polite" aria-atomic="true" className="mt-4 space-y-1.5 text-sm">
				<div className="flex justify-between">
					<dt>小計</dt>
					<dd className="tabular-nums">{yen(itemsTotal(lines))}</dd>
				</div>
				<div className="flex justify-between">
					<dt>送料</dt>
					<dd className="tabular-nums">{yen(shippingFee(lines))}</dd>
				</div>
				<div className="flex justify-between items-baseline pt-2 border-t border-espresso/15">
					<dt>合計</dt>
					<dd className="font-serif text-2xl md:text-[28px] text-caramel tabular-nums">
						{yen(total(lines))}
					</dd>
				</div>
			</dl>
			<p className="text-xs md:text-sm text-roast/70 mt-2">
				{`送料は全国一律、2アイテム分ごとに${yen(SHIPPING_YEN)}です（${SHIPPING_EXAMPLE}）。価格はすべて税込です。`}
			</p>
			{hasQuote && (
				<p className="text-xs md:text-sm text-roast/70 mt-1">
					※時価の商品は合計に含まれません。金額はLINEでご案内します。
				</p>
			)}
		</>
	);
}
