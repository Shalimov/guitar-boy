import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const isProduction = process.env.NODE_ENV === "production";
const baseUrl = isProduction ? "/guitar-boy/" : "/";

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
		define: {
			"process.env.PUBLIC_URL": JSON.stringify(baseUrl),
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
		assetPrefix: baseUrl,
	},
});
