interface Tab {
	label: string;
	active: boolean;
	onClick: () => void;
}

interface TabBarProps {
	tabs: Tab[];
	className?: string;
}

export function TabBar({ tabs, className = "" }: TabBarProps) {
	return (
		<div
			className={`flex gap-1 p-1 rounded-xl ${className}`}
			style={{ background: "var(--gb-bg-panel)", border: "1px solid var(--gb-border)" }}
		>
			{tabs.map(({ label, active, onClick }) => (
				<button
					key={label}
					type="button"
					onClick={onClick}
					style={
						active
							? {
									background: "var(--gb-accent)",
									color: "var(--gb-bg-elev)",
									boxShadow: "0 2px 8px rgba(52,211,153,0.3)",
								}
							: { color: "var(--gb-text-muted)" }
					}
					className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
						active ? "scale-[1.02]" : "hover:bg-[var(--gb-bg-elev)] hover:text-[var(--gb-text)]"
					}`}
				>
					{label}
				</button>
			))}
		</div>
	);
}
