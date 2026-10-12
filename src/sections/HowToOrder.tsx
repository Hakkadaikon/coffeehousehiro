import { Mail, MessageCircle } from "lucide-react";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { EMAIL, LINE_URL } from "../content/shop.ts";
import { ORDER_NOTICE, ORDER_STEPS } from "../content/site.ts";
import { OrderForm } from "../order-form/OrderForm.tsx";

/** ご注文方法。手順、かんたん注文フォーム、LINE とメールの問い合わせ先 */
export function HowToOrder() {
	return (
		<section id="order" className="py-24 md:py-32 px-6 md:px-12 bg-espresso text-paper">
			<div className="max-w-4xl lg:max-w-5xl mx-auto">
				<div className="text-center mb-20">
					<h2 className="font-serif text-4xl md:text-[44px] tracking-widest mb-3">ご注文方法</h2>
					<p className="text-xs md:text-sm tracking-[0.2em] text-paper/60 uppercase">
						How to order
					</p>
				</div>

				<OrderSteps />

				<p className="-mt-8 mb-20 max-w-3xl md:px-4 text-xs md:text-sm text-paper/70 leading-[1.9] tracking-wide text-pretty">
					{ORDER_NOTICE}
					詳しくは
					<a
						href="/legal"
						className="underline underline-offset-4 decoration-paper/30 hover:text-paper hover:decoration-paper/70 transition-colors"
					>
						特定商取引法に基づく表記
					</a>
					をご覧ください。
				</p>

				<OrderForm />

				<ContactCard />
			</div>
		</section>
	);
}

/** 注文から発送までの3つの手順 */
function OrderSteps() {
	return (
		<div className="grid md:grid-cols-3 gap-10 md:gap-8 mb-20 font-serif relative">
			<div className="hidden md:block absolute top-[1.5rem] left-0 w-full h-px bg-paper/10"></div>
			{ORDER_STEPS.map((step) => (
				<div key={step.num} className="relative z-10 md:px-4">
					<div className="w-12 h-12 bg-roast/40 border border-paper/20 flex items-center justify-center text-paper/80 font-serif text-lg mb-7">
						{step.num}
					</div>
					<h3 className="text-base md:text-xl tracking-widest mb-4 text-paper/90">{step.title}</h3>
					<p className="text-sm md:text-[17px] text-paper/80 leading-[1.9] text-left tracking-wide text-pretty">
						{step.desc}
					</p>
				</div>
			))}
		</div>
	);
}

/** 相談・問い合わせ先。LINE を主に、使えない方向けにメールを出す */
function ContactCard() {
	return (
		<div className="mt-20 bg-[#241A16] p-6 md:p-16 text-center relative overflow-hidden">
			<div className="absolute -inset-1 border-[0.5px] border-paper/5 m-4 pointer-events-none"></div>
			<MessageCircle className="w-6 h-6 text-[#06C755] mx-auto mb-6" />
			<p className="font-sans text-sm md:text-lg tracking-widest text-paper/70 mb-8">
				商品のご相談・お問い合わせはLINEへ
			</p>
			<ExternalLink
				href={LINE_URL}
				className="inline-flex w-full sm:w-auto justify-center items-center gap-3 px-6 md:px-12 py-4 md:py-5 whitespace-nowrap tracking-wider md:tracking-widest text-base md:text-xl font-bold bg-[#06C755] hover:bg-[#05b14c] text-white shadow-lg shadow-[#06C755]/20 transition-colors"
			>
				<MessageCircle className="w-5 h-5" />
				LINEでご相談・お問い合わせ
			</ExternalLink>
			<div className="mt-12 pt-8 border-t border-paper/10">
				<p className="text-xs md:text-base text-paper/65 tracking-widest mb-3">
					LINEをご利用でない方は、メールでも承ります
				</p>
				<a
					href={`mailto:${EMAIL}`}
					className="inline-flex items-center gap-2 font-serif text-sm md:text-lg text-paper/75 hover:text-caramel transition-colors tracking-widest break-all"
				>
					<Mail className="w-4 h-4" />
					{EMAIL}
				</a>
			</div>
		</div>
	);
}
