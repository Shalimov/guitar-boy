import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Theme = "light" | "dark" | "system";

export function useDarkMode(): [Theme, (theme: Theme) => void] {
	const [theme, setTheme] = useLocalStorage<Theme>("guitar-boy-theme", "system");

	useEffect(() => {
		const root = document.documentElement;

		const applyTheme = (isDark: boolean) => {
			if (isDark) {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}
		};

		if (theme === "system") {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			applyTheme(mediaQuery.matches);

			const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
			mediaQuery.addEventListener("change", handler);
			return () => mediaQuery.removeEventListener("change", handler);
		}

		applyTheme(theme === "dark");
	}, [theme]);

	return [theme, setTheme];
}
