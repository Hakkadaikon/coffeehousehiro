import { ChevronDown } from "lucide-react";
import { useMemo, useReducer, useState } from "react";
import { CATALOG } from "../content/menu.ts";
import { cartReducer, newCartItem, toLines } from "../order/cart.ts";
import { cleanForm, EMPTY_FORM, type Form, validate } from "../order/form.ts";
import { buildMessage } from "../order/message.ts";
import { total, yen } from "../order/pricing.ts";
import { CartSummary } from "./CartSummary.tsx";
import { DeliveryFields } from "./DeliveryFields.tsx";
import { MessagePanel } from "./MessagePanel.tsx";
import { ProductPicker } from "./ProductPicker.tsx";
import { SaveConsent } from "./SaveConsent.tsx";
import { useCopy } from "./useCopy.ts";
import { useOpenOnLink } from "./useOpenOnLink.ts";
import { useOrderDraft } from "./useOrderDraft.ts";
import { usePicker } from "./usePicker.ts";

/**
 * かんたん注文フォーム。商品を選んでカートに入れ、お届け先を入力すると、
 * LINE でお店に送る注文メッセージができる。状態はここに集め、表示は子の部品に任せる。
 */
export function OrderForm() {
	const [open, setOpen] = useOpenOnLink("#order-form");
	const picker = usePicker(CATALOG);
	const [cart, dispatch] = useReducer(cartReducer, []);
	const [form, setForm] = useState<Form>(EMPTY_FORM);
	const [added, setAdded] = useState(false);

	const clean = cleanForm(form);
	const draft = useOrderDraft({
		cart,
		form: clean,
		onRestore: (savedCart, savedForm) => {
			dispatch({ type: "replace", cart: savedCart });
			setForm(savedForm);
		},
		onForget: () => {
			dispatch({ type: "replace", cart: [] });
			setForm(EMPTY_FORM);
		},
	});

	const lines = useMemo(() => toLines(cart, CATALOG), [cart]);
	const errors = validate(clean);
	const text = buildMessage(lines, clean);
	const canSend = lines.length > 0 && errors.length === 0;
	const { copied, copy, previewRef } = useCopy(text);

	const add = () => {
		dispatch({ type: "add", item: newCartItem(picker.item, picker) });
		picker.setQty(1);
		setAdded(true);
	};

	return (
		<details
			id="order-form"
			open={open}
			onToggle={(e) => setOpen(e.currentTarget.open)}
			className="group mt-20 bg-paper text-espresso shadow-2xl shadow-black/40 scroll-mt-8"
		>
			<summary className="flex items-center justify-between gap-4 p-5 md:p-10 lg:p-12 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
				<div>
					<h3 className="font-serif text-2xl md:text-[32px] tracking-wider md:tracking-widest mb-3">
						<span className="inline-block">かんたん</span>
						<span className="inline-block">注文フォーム</span>
					</h3>
					<p className="text-sm md:text-base text-roast/80 text-pretty">
						メニューから選ぶだけで、LINEで送る注文メッセージができあがります。
					</p>
				</div>
				<span className="shrink-0 flex items-center gap-1 text-sm md:text-base text-caramel">
					<span className="group-open:hidden">開く</span>
					<span className="hidden group-open:inline">閉じる</span>
					<ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
				</span>
			</summary>

			<div className="px-5 pb-5 md:px-10 md:pb-10 lg:px-12 lg:pb-12">
				<SaveConsent
					consent={draft.consent}
					onConsentChange={draft.setConsent}
					onForget={draft.forget}
				/>

				<div className="md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] md:gap-10">
					<div>
						<ProductPicker
							picker={picker}
							onAdd={add}
							addedNote={
								added && lines.length > 0
									? `カートに追加しました（計${lines.length}点・${yen(total(lines))}）`
									: ""
							}
						/>
						<DeliveryFields
							form={form}
							errors={errors}
							onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
						/>
					</div>

					<div className="md:sticky md:top-8 md:self-start mt-10 md:mt-0">
						<CartSummary
							lines={lines}
							onQtyChange={(index, qty) => dispatch({ type: "setQty", index, qty })}
							onRemove={(index) => dispatch({ type: "remove", index })}
						/>
						<MessagePanel
							text={text}
							hasItems={lines.length > 0}
							canSend={canSend}
							copied={copied}
							onCopy={copy}
							previewRef={previewRef}
						/>
					</div>
				</div>
			</div>
		</details>
	);
}
