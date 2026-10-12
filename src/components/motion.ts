// セクションが画面に入ったときのアニメーション(motion の variants)。
import type { Variants } from "motion/react";

/** 下から少し持ち上げながら表示する */
export const fadeIn: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
	},
};

/** 子要素を 0.2 秒ずつずらして表示する */
export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.2 },
	},
};
