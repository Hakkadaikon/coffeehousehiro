// サイトの更新履歴。中身は changelog.yaml に書き、ここでは形を検査して渡す。
import data from "./changelog.yaml";

export type ChangelogEntry = { date: string; items: string[] };

/** 形が違えば読み込んだ時点で例外にして、テストとビルドを止める */
export function parseChangelog(data: unknown): ChangelogEntry[] {
	if (!Array.isArray(data) || data.length === 0) {
		throw new Error("changelog.yaml は「- date: …」で始まる項目のリストで書いてください");
	}
	return data.map((e, i) => {
		const { date, items } = (e ?? {}) as Record<string, unknown>;
		if (typeof date !== "string" || !/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
			throw new Error(`changelog.yaml の${i + 1}件目の date は yyyy/MM/dd で書いてください`);
		}
		if (
			!Array.isArray(items) ||
			items.length === 0 ||
			!items.every((t) => typeof t === "string" && t)
		) {
			throw new Error(
				`changelog.yaml の ${date} の items は、空でない文字列のリストで書いてください`,
			);
		}
		return { date, items };
	});
}

export const CHANGELOG = parseChangelog(data);
