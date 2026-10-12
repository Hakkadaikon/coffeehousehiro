import type { ComponentProps } from "react";

/** 新しいタブで開く外部リンク。開いた先からこのページを操作されないよう noopener を付ける */
export function ExternalLink({ href, ...props }: ComponentProps<"a">) {
	return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
}
