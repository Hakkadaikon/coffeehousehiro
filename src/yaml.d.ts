// .yaml は中身を JSON にしたデータとして import する(vite.config.ts と yaml-loader.mjs)
declare module "*.yaml" {
	const data: unknown;
	export default data;
}
