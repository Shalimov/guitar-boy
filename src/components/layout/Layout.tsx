import { NavLink, Outlet } from "react-router";

const navItems = [
	{ to: "/", label: "Dashboard" },
	{ to: "/whiteboard", label: "Whiteboard" },
	{ to: "/learn", label: "Learn" },
	{ to: "/quiz", label: "Quiz" },
] as const;

export function Layout() {
	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="border-b border-gray-200 bg-white">
				<div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
					<span className="text-lg font-bold text-gray-900">Guitar Boy</span>
					<div className="flex gap-4">
						{navItems.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								end={item.to === "/"}
								className={({ isActive }) =>
									`text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`
								}
							>
								{item.label}
							</NavLink>
						))}
					</div>
				</div>
			</nav>
			<main className="mx-auto max-w-7xl px-4 py-6">
				<Outlet />
			</main>
		</div>
	);
}
