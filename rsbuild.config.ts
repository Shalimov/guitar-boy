import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	plugins: [pluginReact()],
	resolve: {
		alias: {
			"@": "./src",
		},
	},
	source: {
		entry: {
			index: "./src/index.tsx",
		},
	},
	server: {
		port: 5168,
		open: true,
	},
	html: {
		title: "Guitar Boy — Fretboard Learning App",
	},
	output: {
		assetPrefix: "/guitar-boy/",
	},
});
