import type { Theme } from "../../hooks/useDarkMode";

interface ThemeToggleProps {
	theme: Theme;
	onThemeChange: (theme: Theme) => void;
}

const themes: { value: Theme; label: string; icon: string }[] = [
	{ value: "light", label: "Light", icon: "☀️" },
	{ value: "dark", label: "Dark", icon: "🌙" },
	{ value: "system", label: "System", icon: "💻" },
];

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
	return (
		<div className="flex items-center gap-1 rounded-[var(--gb-radius-pill)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-1">
			{themes.map((t) => (
				<button
					key={t.value}
					type="button"
					onClick={() => onThemeChange(t.value)}
					className={`rounded-[var(--gb-radius-pill)] flex items-center justify-center h-8 w-8 text-sm font-medium transition ${
						theme === t.value
							? "bg-[var(--gb-accent)] text-[var(--gb-bg-elev)] shadow-sm"
							: "text-[var(--gb-text-muted)] hover:text-[var(--gb-text)]"
					}`}
					title={t.label}
					aria-label={`Switch to ${t.label} theme`}
				>
					<span>{t.icon}</span>
				</button>
			))}
		</div>
	);
}
