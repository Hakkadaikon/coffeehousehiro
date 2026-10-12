import { useState } from "react";
import { CATALOG, DEFAULT_ROAST, GRINDS, type Grind } from "../content/menu.ts";
import { roastFor } from "../order/cart.ts";

/** 「1. 商品を選ぶ」で選んでいる商品・サイズ・挽き方・焙煎度・数量 */
export function usePicker() {
	const [id, setId] = useState(CATALOG[0].id);
	const [size, setSize] = useState(0);
	const [grind, setGrind] = useState<Grind>(GRINDS[0]);
	const [roast, setRoast] = useState<string>(DEFAULT_ROAST);
	const [qty, setQty] = useState(1);

	const item = CATALOG.find((i) => i.id === id) ?? CATALOG[0];
	return {
		item,
		size,
		grind,
		/** 選んだ商品で選べない焙煎度なら、その商品の最初の焙煎度を返す */
		roast: roastFor(item, roast),
		qty,
		/** 商品を変えたらサイズは先頭に戻す。サイズの並びが商品ごとに違うため */
		selectItem: (next: string) => {
			setId(next);
			setSize(0);
		},
		setSize,
		setGrind,
		setRoast,
		setQty,
	};
}

export type Picker = ReturnType<typeof usePicker>;
