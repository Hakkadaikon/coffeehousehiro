import { CalendarDays, ClipboardList, MessageCircle } from "lucide-react";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { LINE_URL } from "../content/shop.ts";

// スマホは3つ並べるので、アイコンの下に短い文字。PC は横に並べる
const btn =
	"flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 h-14 md:h-12 px-1 md:px-5 text-[11px] md:text-base font-medium md:tracking-wider whitespace-nowrap transition-colors shadow-lg";
const icon = "w-5 h-5 md:w-4 md:h-4 shrink-0";

/** 画面の下に常に出す注文・予約のボタン。スマホは横いっぱいの帯、PC は右下に浮かせる */
export function OrderBar() {
	return (
		<div className="fixed z-40 inset-x-0 bottom-0 grid grid-cols-3 gap-1.5 p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] bg-espresso/90 backdrop-blur md:inset-x-auto md:right-6 md:bottom-6 md:flex md:gap-2 md:p-0 md:bg-transparent md:backdrop-blur-none">
			<a
				href="#order-form"
				className={`${btn} bg-paper text-espresso hover:bg-caramel hover:text-paper`}
			>
				<ClipboardList aria-hidden className={icon} />
				<span className="md:hidden">注文フォーム</span>
				<span className="hidden md:inline">かんたん注文フォーム</span>
			</a>
			<a
				href="#reserve"
				className={`${btn} bg-paper text-espresso hover:bg-caramel hover:text-paper`}
			>
				<CalendarDays aria-hidden className={icon} />
				来店予約
			</a>
			<ExternalLink href={LINE_URL} className={`${btn} bg-[#06C755] hover:bg-[#05b14c] text-white`}>
				<MessageCircle aria-hidden className={icon} />
				LINEで注文・相談
			</ExternalLink>
		</div>
	);
}
