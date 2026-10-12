// お届け先フォームの入力の整形と検査。
import { PAYMENTS } from "../content/shop.ts";

export type Form = {
	name: string;
	postal: string;
	address: string;
	phone: string;
	payment: string;
};

export const LIMITS = { name: 50, postal: 10, address: 200, phone: 15 } as const;

/** 1行の入力欄用。全角を半角に寄せ、制御文字・改行・方向制御文字を消して上限で切る */
export const cleanLine = (s: string, max: number) =>
	s
		.normalize("NFKC")
		// biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を取り除くための正規表現
		.replace(/[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
		.trim()
		.slice(0, max);

/** 郵便番号・電話番号用。長音記号やマイナスなど日本語入力で混じるハイフンを "-" にそろえ、〒を外す */
export const cleanDigits = (s: string, max: number) =>
	cleanLine(s.replace(/[〒\s]/g, "").replace(/[ー－−‐‑–—―]/g, "-"), max);

export const validate = (f: Form) => {
	const errors: (keyof Form)[] = [];
	if (!f.name) errors.push("name");
	if (!/^\d{3}-?\d{4}$/.test(f.postal)) errors.push("postal");
	if (!f.address) errors.push("address");
	if (f.phone && !/^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(f.phone)) errors.push("phone");
	if (!(PAYMENTS as readonly string[]).includes(f.payment)) errors.push("payment");
	return errors;
};
