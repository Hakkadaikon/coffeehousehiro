import type { RefObject } from "react";
import { LINE_CHAT_URL } from "../content/shop.ts";
import { headingCls } from "./controls.tsx";

/** 3. 注文メッセージを確認して送る。コピーしてから LINE のトーク画面を開く */
export function MessagePanel({
	text,
	hasItems,
	canSend,
	copied,
	onCopy,
	previewRef,
}: {
	text: string;
	hasItems: boolean;
	/** カートに商品があり、お届け先とお支払い方法の入力がそろっている */
	canSend: boolean;
	copied: boolean;
	onCopy: () => void;
	previewRef: RefObject<HTMLTextAreaElement | null>;
}) {
	return (
		<>
			<h4 className={`${headingCls} mt-10`}>3. 注文メッセージを確認して送る</h4>
			<textarea
				ref={previewRef}
				readOnly
				value={hasItems ? text : ""}
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
				onClick={canSend ? onCopy : undefined}
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
				onClick={onCopy}
				disabled={!hasItems}
				className="mt-3 w-full h-12 border border-espresso/30 hover:border-espresso transition-colors disabled:opacity-40"
			>
				注文メッセージをコピーする
			</button>
			<p aria-live="polite" className="text-xs md:text-sm text-caramel mt-1 h-4">
				{copied ? "コピーしました" : ""}
			</p>
		</>
	);
}
