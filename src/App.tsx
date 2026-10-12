import { MotionConfig } from "motion/react";
import { Concept } from "./sections/Concept.tsx";
import { Hero } from "./sections/Hero.tsx";
import { HowToOrder } from "./sections/HowToOrder.tsx";
import { InstagramFeed } from "./sections/InstagramFeed.tsx";
import { Menu } from "./sections/Menu.tsx";
import { OrderBar } from "./sections/OrderBar.tsx";
import { RoastSlider } from "./sections/RoastSlider.tsx";
import { SiteFooter } from "./sections/SiteFooter.tsx";
import { SiteHeader } from "./sections/SiteHeader.tsx";

/** ページ全体。上から順にセクションを並べるだけで、中身は sections/ にある */
export default function App() {
	return (
		<MotionConfig reducedMotion="user">
			<div className="min-h-screen bg-paper text-espresso font-sans">
				<SiteHeader />
				<main>
					<Hero />
					<Concept />
					<InstagramFeed />
					<Menu />
					<RoastSlider />
					<HowToOrder />
				</main>
				<SiteFooter />
				<OrderBar />
			</div>
		</MotionConfig>
	);
}
