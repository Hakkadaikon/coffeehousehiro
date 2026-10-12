import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { catalog, GRINDS } from "./content/menu.ts";
import { LINE_CHAT_URL, PAYMENTS } from "./content/shop.ts";
import { type CartItem, isExpired, MAX_QTY, restoreCart } from "./order/cart.ts";
import { clearDraft, loadDraft, saveDraft } from "./order/draftStore.ts";
import { cleanDigits, cleanLine, type Form, LIMITS, validate } from "./order/form.ts";
import { buildMessage } from "./order/message.ts";
import { formatPrices, type Line, shippingFee, subtotal, total, yen } from "./order/pricing.ts";

const CATALOG = catalog();
const GROUPS = [...new Set(CATALOG.map((i) => i.id.split("/")[0]))];

const inputCls =
	"w-full h-12 px-3 bg-white/70 border border-espresso/20 focus:border-caramel focus:outline-none text-base";
const headingCls = "font-serif text-lg md:text-xl tracking-widest mb-4";

function Choice({
	legend,
	options,
	value,
	onChange,
	cols,
	render = (o) => o,
}: {
	legend: string;
	options: readonly string[];
	value: string;
	onChange: (v: string) => void;
	cols: string;
	render?: (o: string, i: number) => string;
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

function Stepper({
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

const emptyForm: Form = { name: "", postal: "", address: "", phone: "", payment: "" };

export default function OrderBuilder() {
	const [pickId, setPickId] = useState(CATALOG[0].id);
	const [pickSize, setPickSize] = useState(0);
	const [pickGrind, setPickGrind] = useState<string>(GRINDS[0]);
	const [pickRoast, setPickRoast] = useState("おまかせ");
	const [pickQty, setPickQty] = useState(1);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [form, setForm] = useState<Form>(emptyForm);
	const [consent, setConsent] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [copied, setCopied] = useState(false);
	const [added, setAdded] = useState(false);
	// 普段は閉じておき、ページ内リンク(#order-form)で来たときだけ開く
	const [open, setOpen] = useState(false);
	useEffect(() => {
		const openIfTargeted = () => {
			if (window.location.hash === "#order-form") setOpen(true);
		};
		// ハッシュが同じままリンクを押し直したときも開く
		const openOnLink = (e: MouseEvent) => {
			if (e.target instanceof Element && e.target.closest('a[href="#order-form"]')) setOpen(true);
		};
		openIfTargeted();
		window.addEventListener("hashchange", openIfTargeted);
		document.addEventListener("click", openOnLink);
		return () => {
			window.removeEventListener("hashchange", openIfTargeted);
			document.removeEventListener("click", openOnLink);
		};
	}, []);
	const previewRef = useRef<HTMLTextAreaElement>(null);
	/** 復元した直後は保存しない。開いただけで保存日時が延びないようにする */
	const skipSave = useRef(false);
	const prevConsent = useRef(false);

	const picked = CATALOG.find((i) => i.id === pickId) ?? CATALOG[0];

	// 保存データの読み込み。保存があるのは、以前「この端末に保存する」を選んだときだけ
	useEffect(() => {
		loadDraft()
			.then((d) => {
				if (!d) return;
				if (isExpired(d.savedAt, Date.now())) return clearDraft();
				const str = (v: unknown) => (typeof v === "string" ? v : "");
				skipSave.current = true;
				setCart(restoreCart(d, CATALOG, Date.now()));
				setForm({
					name: str(d.form?.name),
					postal: str(d.form?.postal),
					address: str(d.form?.address),
					phone: "",
					payment: str(d.form?.payment),
				});
				setConsent(true);
			})
			.catch(() => {})
			.finally(() => setLoaded(true));
	}, []);

	const clean: Form = {
		name: cleanLine(form.name, LIMITS.name),
		postal: cleanDigits(form.postal, LIMITS.postal),
		address: cleanLine(form.address, LIMITS.address),
		phone: cleanDigits(form.phone, LIMITS.phone),
		payment: form.payment,
	};

	// 同意があるときだけ保存し、同意を外したら消す。電話番号は保存しない
	const { name, postal, address, payment } = clean;
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

	const lines: (Line & { item: CartItem })[] = useMemo(
		() =>
			cart.flatMap((c) => {
				const item = CATALOG.find((i) => i.id === c.id);
				if (!item) return [];
				const size = item.sizes[c.size];
				const label =
					item.kind === "bean" ? `${item.label}　${size}・${c.grind}・${c.roast}` : item.label;
				return [{ kind: item.kind, yen: item.prices[c.size], qty: c.qty, label, item: c }];
			}),
		[cart],
	);

	const errors = validate(clean);
	const text = buildMessage(lines, clean);
	const canSend = lines.length > 0 && errors.length === 0;
	const hasQuote = lines.some((l) => l.yen === null);

	const add = () => {
		const roast = picked.roasts.includes(pickRoast) ? pickRoast : picked.roasts[0];
		const next: CartItem =
			picked.kind === "bean"
				? { id: picked.id, size: pickSize, qty: pickQty, grind: pickGrind, roast }
				: { id: picked.id, size: pickSize, qty: pickQty, grind: "", roast: "" };
		setCart((c) => [...c, next]);
		setPickQty(1);
		setAdded(true);
	};

	const setQty = (idx: number, qty: number) =>
		setCart((c) => c.map((x, i) => (i === idx ? { ...x, qty } : x)));

	// クリック中に呼ぶ。失敗したらプレビューを選択状態にして手動コピーを促す
	const copy = () =>
		(navigator.clipboard?.writeText(text) ?? Promise.reject()).then(
			() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 3000);
			},
			() => previewRef.current?.select(),
		);

	const clearSaved = async () => {
		if (!window.confirm("この端末に保存したご注文内容とお届け先を消去します。よろしいですか？"))
			return;
		setConsent(false);
		setCart([]);
		setForm(emptyForm);
		await clearDraft().catch(() => {});
	};

	const field = (
		key: keyof Form,
		label: string,
		props: React.InputHTMLAttributes<HTMLInputElement>,
	) => {
		const invalid = errors.includes(key) && form[key] !== "";
		return (
			<label className="block mb-4">
				<span className="block text-sm md:text-base text-roast/80 mb-1.5">{label}</span>
				<input
					{...props}
					value={form[key]}
					onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
					aria-invalid={invalid}
					className={`${inputCls} ${invalid ? "border-red-700" : ""}`}
				/>
			</label>
		);
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
				<div className="border-l-2 border-caramel bg-paper-dim px-4 py-3 text-xs md:text-sm text-roast/85 leading-relaxed mb-8">
					<p className="text-pretty">
						入力内容は、当サイトのサーバーには送信しません。「この端末に保存する」を選んだときだけ、この端末のブラウザ（IndexedDB）に保存します。最後に保存してから30日を過ぎた内容は、次にこのページを開いたときに消去します。電話番号は保存しません。
					</p>
					<label className="mt-3 flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={consent}
							onChange={(e) => setConsent(e.target.checked)}
							className="size-4 accent-caramel"
						/>
						この端末に保存する
					</label>
					{consent && (
						<button
							type="button"
							onClick={clearSaved}
							className="mt-2 text-xs text-roast/70 underline"
						>
							保存した内容を消去
						</button>
					)}
				</div>

				<div className="md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] md:gap-10">
					<div>
						<h4 className={headingCls}>1. 商品を選ぶ</h4>
						<label className="block mb-5">
							<span className="block text-sm md:text-base text-roast/80 mb-1.5">商品</span>
							<select
								value={pickId}
								onChange={(e) => {
									setPickId(e.target.value);
									setPickSize(0);
								}}
								className={inputCls}
							>
								{GROUPS.map((g) => (
									<optgroup key={g} label={g}>
										{CATALOG.filter((i) => i.id.startsWith(`${g}/`)).map((i) => (
											<option key={i.id} value={i.id}>
												{i.label}
											</option>
										))}
									</optgroup>
								))}
							</select>
						</label>

						{picked.kind === "bean" && (
							<>
								<Choice
									legend="豆 / 粉"
									options={GRINDS}
									value={pickGrind}
									onChange={setPickGrind}
									cols="grid-cols-2"
								/>
								<Choice
									legend="焙煎度"
									options={picked.roasts}
									value={picked.roasts.includes(pickRoast) ? pickRoast : picked.roasts[0]}
									onChange={setPickRoast}
									cols={picked.roasts.length === 1 ? "grid-cols-1" : "grid-cols-4"}
								/>
							</>
						)}
						<Choice
							legend="サイズ"
							options={picked.sizes}
							value={picked.sizes[pickSize]}
							onChange={(v) => setPickSize(picked.sizes.indexOf(v))}
							cols={picked.sizes.length === 1 ? "grid-cols-1" : "grid-cols-2"}
							render={(o, i) => `${o}　${formatPrices([picked.prices[i]])}`}
						/>
						<div className="flex items-center gap-4 mb-5">
							<span className="text-sm text-roast/80">数量</span>
							<Stepper value={pickQty} onChange={setPickQty} />
						</div>
						<button
							type="button"
							onClick={add}
							className="w-full h-12 border border-espresso hover:bg-espresso hover:text-paper tracking-widest transition-colors mb-2 md:mb-10"
						>
							カートに追加
						</button>
						<p aria-live="polite" className="text-sm text-caramel mb-8 min-h-5 md:hidden">
							{added && lines.length > 0
								? `カートに追加しました（計${lines.length}点・${yen(total(lines))}）`
								: ""}
						</p>

						<h4 className={headingCls}>2. お届け先とお支払い</h4>
						{field("name", "お名前", {
							autoComplete: "name",
							maxLength: LIMITS.name,
							required: true,
						})}
						{field("postal", "郵便番号", {
							autoComplete: "postal-code",
							inputMode: "numeric",
							placeholder: "123-4567",
							maxLength: LIMITS.postal,
							required: true,
						})}
						{field("address", "ご住所", {
							autoComplete: "street-address",
							maxLength: LIMITS.address,
							required: true,
						})}
						{field("phone", "電話番号（任意・保存しません）", {
							type: "tel",
							autoComplete: "tel",
							maxLength: LIMITS.phone,
						})}
						<Choice
							legend="お支払い方法"
							options={PAYMENTS}
							value={form.payment}
							onChange={(payment) => setForm((f) => ({ ...f, payment }))}
							cols="grid-cols-3"
						/>
					</div>

					<div className="md:sticky md:top-8 md:self-start mt-10 md:mt-0">
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
											key={`${l.item.id}-${idx}`}
											className="flex items-start justify-between gap-3 py-3 border-b border-espresso/10"
										>
											<div className="font-serif text-sm md:text-base min-w-0">{l.label}</div>
											<div className="flex flex-col items-end gap-1.5 shrink-0">
												<Stepper small value={l.qty} onChange={(q) => setQty(idx, q)} />
												<span className="tabular-nums text-sm">
													{s === null ? "時価・要相談" : yen(s)}
												</span>
												<button
													type="button"
													onClick={() => setCart((c) => c.filter((_, i) => i !== idx))}
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
								<dd className="tabular-nums">{yen(total(lines) - shippingFee(lines))}</dd>
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
							送料は全国一律、2アイテム分ごとに¥270です。
						</p>
						{hasQuote && (
							<p className="text-xs md:text-sm text-roast/70 mt-1">
								※時価の商品は合計に含まれません。金額はLINEでご案内します。
							</p>
						)}

						<h4 className={`${headingCls} mt-10`}>3. 注文メッセージを確認して送る</h4>
						<textarea
							ref={previewRef}
							readOnly
							value={lines.length ? text : ""}
							placeholder="商品をカートに追加すると、ここに注文メッセージが表示されます。"
							aria-label="注文メッセージのプレビュー"
							className="w-full h-72 whitespace-pre-wrap font-sans text-sm leading-relaxed bg-white/70 border border-espresso/15 p-4 resize-none"
						/>
						{!canSend && (
							<p className="text-xs md:text-sm text-roast/70 mt-2">
								商品をカートに追加し、お名前・郵便番号・ご住所・お支払い方法を入力すると送信できます。
							</p>
						)}
						<a
							href={canSend ? LINE_CHAT_URL : undefined}
							target="_blank"
							rel="noopener noreferrer"
							onClick={canSend ? copy : undefined}
							aria-disabled={!canSend}
							className={`mt-4 w-full h-14 flex items-center justify-center bg-[#06C755] text-white font-bold tracking-widest md:text-lg shadow-lg shadow-[#06C755]/20 transition-opacity ${
								canSend ? "hover:bg-[#05b14c]" : "opacity-40 pointer-events-none"
							}`}
						>
							コピーしてLINEを開く
						</a>
						<p className="text-xs md:text-sm text-roast/70 mt-2 text-pretty">
							注文メッセージをコピーして、LINEのトーク画面を開きます。入力欄に貼り付けて送信すると、ご注文がお店に届きます。
						</p>
						<button
							type="button"
							onClick={copy}
							disabled={lines.length === 0}
							className="mt-3 w-full h-12 border border-espresso/30 hover:border-espresso transition-colors disabled:opacity-40"
						>
							注文メッセージをコピーする
						</button>
						<p aria-live="polite" className="text-xs md:text-sm text-caramel mt-1 h-4">
							{copied ? "コピーしました" : ""}
						</p>
					</div>
				</div>
			</div>
		</details>
	);
}
