// 注文フォームで使う入力部品。見た目のクラスはここにまとめる。
import type { InputHTMLAttributes } from "react";
import { MAX_QTY } from "../order/cart.ts";

export const inputCls =
	"w-full h-12 px-3 bg-white/70 border border-espresso/20 focus:border-caramel focus:outline-none text-base";
export const headingCls = "font-serif text-lg md:text-xl tracking-widest mb-4";

/** ボタン風のラジオボタンの組。cols には grid-cols-* のクラスをそのまま渡す */
export function Choice<T extends string>({
	legend,
	options,
	value,
	onChange,
	cols,
	render = (o) => o,
}: {
	legend: string;
	options: readonly T[];
	value: string;
	onChange: (v: T) => void;
	cols: string;
	render?: (o: T, i: number) => string;
}) {
	return (
		<fieldset className="mb-5">
			<legend className="text-sm md:text-base text-roast/80 mb-2">{legend}</legend>
			<div className={`grid ${cols} gap-2`}>
				{options.map((o, i) => (
					<label
						key={o}
						className={`h-11 flex items-center justify-center border text-sm md:text-base cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-caramel ${
							value === o
								? "bg-espresso text-paper border-espresso"
								: "border-espresso/20 hover:border-espresso/50"
						}`}
					>
						<input
							type="radio"
							name={legend}
							value={o}
							checked={value === o}
							onChange={() => onChange(o)}
							className="sr-only"
						/>
						{render(o, i)}
					</label>
				))}
			</div>
		</fieldset>
	);
}

/** 数量の増減。1〜MAX_QTY の範囲だけ動かせる */
export function Stepper({
	value,
	onChange,
	small,
}: {
	value: number;
	onChange: (n: number) => void;
	small?: boolean;
}) {
	const btn = `${small ? "w-11 md:w-8" : "w-11"} flex items-center justify-center disabled:opacity-30`;
	return (
		<div className={`inline-flex ${small ? "h-11 md:h-8" : "h-11"} border border-espresso/20`}>
			<button
				type="button"
				className={btn}
				aria-label="数量を減らす"
				disabled={value <= 1}
				onClick={() => onChange(value - 1)}
			>
				−
			</button>
			<output
				className={`${small ? "w-11 md:w-8" : "w-11"} flex items-center justify-center tabular-nums`}
			>
				{value}
			</output>
			<button
				type="button"
				className={btn}
				aria-label="数量を増やす"
				disabled={value >= MAX_QTY}
				onClick={() => onChange(value + 1)}
			>
				＋
			</button>
		</div>
	);
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
	label: string;
	value: string;
	invalid: boolean;
	onChange: (value: string) => void;
};

/** ラベル付きの1行入力欄。invalid のときだけ赤枠にする */
export function TextField({ label, value, invalid, onChange, ...props }: TextFieldProps) {
	return (
		<label className="block mb-4">
			<span className="block text-sm md:text-base text-roast/80 mb-1.5">{label}</span>
			<input
				{...props}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-invalid={invalid}
				className={`${inputCls} ${invalid ? "border-red-700" : ""}`}
			/>
		</label>
	);
}
