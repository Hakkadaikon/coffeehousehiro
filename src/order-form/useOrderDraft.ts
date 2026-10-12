import { useEffect, useRef, useState } from "react";
import { CATALOG } from "../content/menu.ts";
import { type CartItem, isExpired, restoreCart } from "../order/cart.ts";
import { clearDraft, loadDraft, saveDraft } from "../order/draftStore.ts";
import { type Form, restoreForm } from "../order/form.ts";

/**
 * 注文フォームの下書きを、同意があるときだけこの端末(IndexedDB)に保存する。
 * - 開いたときに保存があれば復元する。保存があるのは、以前「この端末に保存する」を選んだときだけ
 * - 復元した直後は保存しない。開いただけで保存日時が延びないようにする
 * - 同意を外したら消す。電話番号は保存しない
 */
export function useOrderDraft({
	cart,
	form,
	onRestore,
	onForget,
}: {
	cart: CartItem[];
	/** 整えたあとのフォーム */
	form: Form;
	onRestore: (cart: CartItem[], form: Form) => void;
	onForget: () => void;
}) {
	const [consent, setConsent] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const skipSave = useRef(false);
	const prevConsent = useRef(false);

	// 開いたときに一度だけ読み込む。onRestore は読み込んだ時点のものでよい
	// biome-ignore lint/correctness/useExhaustiveDependencies: マウント時だけ実行する
	useEffect(() => {
		loadDraft()
			.then((d) => {
				if (!d) return;
				if (isExpired(d.savedAt, Date.now())) return clearDraft();
				skipSave.current = true;
				onRestore(restoreCart(d, CATALOG, Date.now()), restoreForm(d.form));
				setConsent(true);
			})
			.catch(() => {})
			.finally(() => setLoaded(true));
	}, []);

	const { name, postal, address, payment } = form;
	useEffect(() => {
		if (!loaded) return;
		const turnedOff = prevConsent.current && !consent;
		prevConsent.current = consent;
		if (turnedOff) {
			clearDraft().catch(() => {});
			return;
		}
		if (!consent) return;
		if (skipSave.current) {
			skipSave.current = false;
			return;
		}
		saveDraft({ savedAt: Date.now(), cart, form: { name, postal, address, payment } }).catch(
			() => {},
		);
	}, [loaded, consent, cart, name, postal, address, payment]);

	/** 確認のうえ、保存した下書きと入力中の内容を消す */
	const forget = async () => {
		if (!window.confirm("この端末に保存したご注文内容とお届け先を消去します。よろしいですか？"))
			return;
		setConsent(false);
		onForget();
		await clearDraft().catch(() => {});
	};

	return { consent, setConsent, forget };
}
