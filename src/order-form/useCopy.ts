import { useRef, useState } from "react";

/**
 * text をクリップボードにコピーする。クリックの処理中に呼ぶこと。
 * コピーできないブラウザでは、プレビュー欄を選択状態にして手動コピーを促す。
 */
export function useCopy(text: string) {
	const [copied, setCopied] = useState(false);
	const previewRef = useRef<HTMLTextAreaElement>(null);
	const copy = () =>
		(navigator.clipboard?.writeText(text) ?? Promise.reject()).then(
			() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 3000);
			},
			() => previewRef.current?.select(),
		);
	return { copied, copy, previewRef };
}
