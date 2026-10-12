import { CATALOG_GROUPS, GRINDS } from "../content/menu.ts";
import { formatPrices } from "../order/pricing.ts";
import { Choice, headingCls, inputCls, Stepper } from "./controls.tsx";
import type { Picker } from "./usePicker.ts";

/** 1. 商品を選ぶ。選んだ内容は picker が持ち、カートに入れるのは onAdd */
export function ProductPicker({
	picker,
	onAdd,
	addedNote,
}: {
	picker: Picker;
	onAdd: () => void;
	/** カートに追加した直後のお知らせ(スマホ用)。なければ空文字 */
	addedNote: string;
}) {
	const { item } = picker;
	return (
		<>
			<h4 className={headingCls}>1. 商品を選ぶ</h4>
			<label className="block mb-5">
				<span className="block text-sm md:text-base text-roast/80 mb-1.5">商品</span>
				<select
					value={item.id}
					onChange={(e) => picker.selectItem(e.target.value)}
					className={inputCls}
				>
					{CATALOG_GROUPS.map(([group, items]) => (
						<optgroup key={group} label={group}>
							{items.map((i) => (
								<option key={i.id} value={i.id}>
									{i.label}
								</option>
							))}
						</optgroup>
					))}
				</select>
			</label>

			{item.kind === "bean" && (
				<>
					<Choice
						legend="豆 / 粉"
						options={GRINDS}
						value={picker.grind}
						onChange={picker.setGrind}
						cols="grid-cols-2"
					/>
					<Choice
						legend="焙煎度"
						options={item.roasts}
						value={picker.roast}
						onChange={picker.setRoast}
						cols={item.roasts.length === 1 ? "grid-cols-1" : "grid-cols-4"}
					/>
				</>
			)}
			<Choice
				legend="サイズ"
				options={item.sizes}
				value={item.sizes[picker.size]}
				onChange={(v) => picker.setSize(item.sizes.indexOf(v))}
				cols={item.sizes.length === 1 ? "grid-cols-1" : "grid-cols-2"}
				render={(o, i) => `${o}　${formatPrices([item.prices[i]])}`}
			/>
			<div className="flex items-center gap-4 mb-5">
				<span className="text-sm text-roast/80">数量</span>
				<Stepper value={picker.qty} onChange={picker.setQty} />
			</div>
			<button
				type="button"
				onClick={onAdd}
				className="w-full h-12 border border-espresso hover:bg-espresso hover:text-paper tracking-widest transition-colors mb-2 md:mb-10"
			>
				カートに追加
			</button>
			<p aria-live="polite" className="text-sm text-caramel mb-8 min-h-5 md:hidden">
				{addedNote}
			</p>
		</>
	);
}
