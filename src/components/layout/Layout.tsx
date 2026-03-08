import { NavLink, Outlet } from "react-router";
import { useDarkMode } from "../../hooks/useDarkMode";
import { ThemeToggle } from "../ui/ThemeToggle";

const navItems = [
	{ to: "/", label: "Dashboard" },
	{ to: "/whiteboard", label: "Whiteboard" },
	{ to: "/learn", label: "Learn" },
	{ to: "/quiz", label: "Quiz" },
] as const;

export function Layout() {
	const [theme, setTheme] = useDarkMode();

	return (
		<div className="relative flex min-h-screen flex-col overflow-x-hidden text-[var(--gb-text)]">
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(179,93,42,0.24),_transparent_70%)] blur-3xl" />
				<div className="absolute -right-20 -top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(91,62,43,0.24),_transparent_70%)] blur-3xl" />
				<div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(232,180,141,0.33),_transparent_70%)] blur-3xl" />
			</div>

			<nav className="sticky top-0 z-20 border-b border-[var(--gb-border)]/80 bg-[color:var(--gb-bg-elev)]/85 backdrop-blur-md">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
					<div className="flex flex-wrap items-center gap-4">
						<span className="text-xl font-bold tracking-[0.01em] text-[var(--gb-text)]">
							Guitar Boy
						</span>
						<div className="flex flex-wrap gap-2">
							{navItems.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									end={item.to === "/"}
									className={({ isActive }) =>
										`rounded-[var(--gb-radius-pill)] px-4 py-2 text-sm font-semibold transition ${
											isActive
												? "bg-[var(--gb-accent)] text-[#fff7ef] shadow-[0_9px_20px_rgba(179,93,42,0.35)]"
												: "text-[var(--gb-text-muted)] hover:bg-[var(--gb-bg-panel)] hover:text-[var(--gb-text)]"
										}`
									}
								>
									{item.label}
								</NavLink>
							))}
						</div>
					</div>
					<ThemeToggle theme={theme} onThemeChange={setTheme} />
				</div>
			</nav>
			<main className="flex-1 mx-auto w-full max-w-7xl px-4 pb-10 pt-8 md:px-6">
				<Outlet />
			</main>
		</div>
	);
}
