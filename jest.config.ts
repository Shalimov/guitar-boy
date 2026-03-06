import type { Config } from "jest";

const config: Config = {
	testEnvironment: "jsdom",
	roots: ["<rootDir>/src"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
	transform: {
		"^.+\\.(t|j)sx?$": [
			"@swc/jest",
			{
				jsc: {
					parser: {
						syntax: "typescript",
						tsx: true,
					},
					transform: {
						react: {
							runtime: "automatic",
						},
					},
				},
			},
		],
	},
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"^tone$": "<rootDir>/src/__mocks__/tone.ts",
		"^react-konva$": "<rootDir>/src/__mocks__/reactKonvaMock.tsx",
		"\\.(css|less|scss|sass)$": "identity-obj-proxy",
		"\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/__mocks__/fileMock.ts",
	},
	setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
};

export default config;
