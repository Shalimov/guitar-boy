import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const isProduction = process.env.NODE_ENV === "production";
const baseUrl = isProduction ? "/guitar-boy/" : "/";

// Prefer an explicit override, otherwise fall back to GitHub Actions values when available.
// During local dev this will be an empty string unless explicitly set.
const githubRepoUrl =
	process.env.GITHUB_REPO_URL ||
	(process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
		? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
		: "");

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
			"process.env.GITHUB_REPO_URL": JSON.stringify(githubRepoUrl),
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
