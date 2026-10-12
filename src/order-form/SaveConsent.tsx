import { SAVE_DAYS } from "../order/draft.ts";

/** 端末への保存の説明と、保存する・消去するの操作 */
export function SaveConsent({
	consent,
	onConsentChange,
	onForget,
}: {
	consent: boolean;
	onConsentChange: (consent: boolean) => void;
	onForget: () => void;
}) {
	return (
		<div className="border-l-2 border-caramel bg-paper-dim px-4 py-3 text-xs md:text-sm text-roast/85 leading-relaxed mb-8">
			<p className="text-pretty">
				{`入力内容は、当サイトのサーバーには送信しません。「この端末に保存する」を選んだときだけ、この端末のブラウザ（IndexedDB）に保存します。最後に保存してから${SAVE_DAYS}日を過ぎた内容は、次にこのページを開いたときに消去します。電話番号は保存しません。`}
			</p>
			<label className="mt-3 flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					checked={consent}
					onChange={(e) => onConsentChange(e.target.checked)}
					className="size-4 accent-caramel"
				/>
				この端末に保存する
			</label>
			{consent && (
				<button type="button" onClick={onForget} className="mt-2 text-xs text-roast/70 underline">
					保存した内容を消去
				</button>
			)}
		</div>
	);
}
