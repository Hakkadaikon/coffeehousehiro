// 注文フォームの下書きを、この端末のブラウザ(IndexedDB)にだけ保存する。サーバーには送らない。
import type { CartItem } from "./order.ts";

export type Draft = {
	savedAt: number;
	cart: CartItem[];
	/** 電話番号は保存しない */
	form: { name: string; postal: string; address: string; payment: string };
};

const DB = "coffeehousehiro";
const STORE = "order";
const KEY = "draft";

const open = () =>
	new Promise<IDBDatabase>((resolve, reject) => {
		const req = indexedDB.open(DB, 1);
		req.onupgradeneeded = () => req.result.createObjectStore(STORE);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});

const run = async <T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) => {
	const db = await open();
	try {
		return await new Promise<T>((resolve, reject) => {
			const req = fn(db.transaction(STORE, mode).objectStore(STORE));
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	} finally {
		db.close();
	}
};

export const loadDraft = () => run<Draft | undefined>("readonly", (s) => s.get(KEY));
export const saveDraft = (d: Draft) => run("readwrite", (s) => s.put(d, KEY));
export const clearDraft = () => run("readwrite", (s) => s.clear());
