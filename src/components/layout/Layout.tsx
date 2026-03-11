import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router";
import { useDarkMode } from "../../hooks/useDarkMode";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";
import { OnboardingWizard } from "./OnboardingWizard";

const navItems = [
	{ to: "/", label: "Dashboard", icon: "🏠" },
	{ to: "/whiteboard", label: "Whiteboard", icon: "🎨" },
	{ to: "/learn", label: "Learn", icon: "📖" },
	{ to: "/ear-training", label: "Ear Training", icon: "🎧" },
	{ to: "/quiz", label: "Quiz", icon: "⚡" },
] as const;

export function Layout() {
	const [theme, setTheme] = useDarkMode();
	const [isWizardOpen, setIsWizardOpen] = useState(false);

	useEffect(() => {
		const shown = localStorage.getItem("gb_onboarding_shown");
		if (!shown) {
			setIsWizardOpen(true);
		}
	}, []);

	return (
		<div className="relative flex min-h-screen flex-col text-[var(--gb-text)]">
			<OnboardingWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(179,93,42,0.24),_transparent_70%)] blur-3xl" />
				<div className="absolute -right-20 -top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(91,62,43,0.24),_transparent_70%)] blur-3xl" />
				<div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(232,180,141,0.33),_transparent_70%)] blur-3xl" />
			</div>

			<nav className="sticky top-0 z-20 border-b border-[var(--gb-border)]/80 bg-[color:var(--gb-bg-elev)]/85 backdrop-blur-md">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
					<div className="flex flex-wrap items-center gap-4">
						<span className="hidden sm:inline text-xl font-bold tracking-[0.01em] text-[var(--gb-text)] pr-2">
							Guitar Boy
						</span>
						<div className="flex flex-wrap gap-1.5 p-1 rounded-full border border-[var(--gb-border)] bg-[var(--gb-bg-elev)]/50">
							{navItems.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									end={item.to === "/"}
									title={item.label}
									className={({ isActive }) =>
										`flex items-center justify-center h-10 w-10 text-lg transition-all rounded-full ${
											isActive
												? "bg-[var(--gb-accent)] text-[#fff7ef] shadow-md scale-110"
												: "text-[var(--gb-text-muted)] hover:bg-[var(--gb-bg-panel)] hover:text-[var(--gb-text)]"
										}`
									}
								>
									{item.icon}
								</NavLink>
							))}
							<div className="w-[1px] h-6 my-auto mx-1 bg-[var(--gb-border)] opacity-50" />
							<button
								type="button"
								onClick={() => setIsWizardOpen(true)}
								className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--gb-text-muted)] hover:bg-[var(--gb-bg-panel)] hover:text-[var(--gb-text)] transition-all"
								title="Show Intro Guide"
							>
								<span className="text-xl font-bold">?</span>
							</button>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<ThemeToggle theme={theme} onThemeChange={setTheme} />
					</div>
				</div>
			</nav>

			<main className="flex-1 mx-auto w-full max-w-7xl px-4 pb-10 pt-8 md:px-6">
				<Outlet />
			</main>
		</div>
	);
}
