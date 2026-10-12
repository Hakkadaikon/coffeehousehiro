import { PAYMENTS } from "../content/shop.ts";
import { type Form, LIMITS } from "../order/form.ts";
import { Choice, headingCls, TextField } from "./controls.tsx";

/** 2. お届け先とお支払い。入力途中の値を表示し、入力のあるおかしな欄だけ赤枠にする */
export function DeliveryFields({
	form,
	errors,
	onChange,
}: {
	form: Form;
	errors: (keyof Form)[];
	onChange: (key: keyof Form, value: string) => void;
}) {
	const fieldProps = (key: keyof Form) => ({
		value: form[key],
		invalid: errors.includes(key) && form[key] !== "",
		onChange: (value: string) => onChange(key, value),
	});
	return (
		<>
			<h4 className={headingCls}>2. お届け先とお支払い</h4>
			<TextField
				label="お名前"
				autoComplete="name"
				maxLength={LIMITS.name}
				required
				{...fieldProps("name")}
			/>
			<TextField
				label="郵便番号"
				autoComplete="postal-code"
				inputMode="numeric"
				placeholder="123-4567"
				maxLength={LIMITS.postal}
				required
				{...fieldProps("postal")}
			/>
			<TextField
				label="ご住所"
				autoComplete="street-address"
				maxLength={LIMITS.address}
				required
				{...fieldProps("address")}
			/>
			<TextField
				label="電話番号（任意・保存しません）"
				type="tel"
				autoComplete="tel"
				maxLength={LIMITS.phone}
				{...fieldProps("phone")}
			/>
			<Choice
				legend="お支払い方法"
				options={PAYMENTS}
				value={form.payment}
				onChange={(payment) => onChange("payment", payment)}
				cols="grid-cols-3"
			/>
		</>
	);
}
