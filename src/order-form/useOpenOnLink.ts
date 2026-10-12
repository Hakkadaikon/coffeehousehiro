import { useEffect, useState } from "react";

/**
 * 普段は閉じておき、ページ内リンク(href が hash のもの)で来たときだけ開く開閉状態。
 * ハッシュが同じままリンクを押し直したときも開く。
 */
export function useOpenOnLink(hash: string) {
	const [open, setOpen] = useState(false);
	useEffect(() => {
		const openIfTargeted = () => {
			if (window.location.hash === hash) setOpen(true);
		};
		const openOnLink = (e: MouseEvent) => {
			if (e.target instanceof Element && e.target.closest(`a[href="${hash}"]`)) setOpen(true);
		};
		openIfTargeted();
		window.addEventListener("hashchange", openIfTargeted);
		document.addEventListener("click", openOnLink);
		return () => {
			window.removeEventListener("hashchange", openIfTargeted);
			document.removeEventListener("click", openOnLink);
		};
	}, [hash]);
	return [open, setOpen] as const;
}
