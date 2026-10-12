import { ClipboardList, MessageCircle } from "lucide-react";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { LINE_URL } from "../content/shop.ts";

const btn =
	"inline-flex items-center justify-center gap-1.5 md:gap-2 h-12 px-2 md:px-5 text-[13px] md:text-base font-medium md:tracking-wider whitespace-nowrap transition-colors shadow-lg";

/** 画面の下に常に出す注文ボタン。スマホは横いっぱいの帯、PC は右下に浮かせる */
export function OrderBar() {
	return (
		<div className="fixed z-40 inset-x-0 bottom-0 grid grid-cols-2 gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-espresso/90 backdrop-blur md:inset-x-auto md:right-6 md:bottom-6 md:flex md:p-0 md:bg-transparent md:backdrop-blur-none">
			<a
				href="#order-form"
				className={`${btn} bg-paper text-espresso hover:bg-caramel hover:text-paper`}
			>
				<ClipboardList aria-hidden className="hidden min-[360px]:block w-4 h-4 shrink-0" />
				かんたん注文フォーム
			</a>
			<ExternalLink href={LINE_URL} className={`${btn} bg-[#06C755] hover:bg-[#05b14c] text-white`}>
				<MessageCircle aria-hidden className="hidden min-[360px]:block w-4 h-4 shrink-0" />
				LINEで注文・相談
			</ExternalLink>
		</div>
	);
}
