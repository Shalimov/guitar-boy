export interface ShortcutItem {
	keyLabel: string;
	action: string;
	id?: string;
}

interface KeyboardShortcutsBarProps {
	items: readonly ShortcutItem[];
	title?: string;
	className?: string;
}

export function KeyboardShortcutsBar({
	items,
	title = "Shortcuts:",
	className = "",
}: KeyboardShortcutsBarProps) {
	return (
		<div
			className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-4 py-2 text-[10px] shadow-sm ${className}`}
		>
			<span className="font-semibold text-[var(--gb-text-muted)]">{title}</span>
			{items.map((item, index) => (
				<span
					key={item.id ?? `${item.keyLabel}-${item.action}-${index}`}
					className="flex items-center gap-1 font-medium text-[var(--gb-text-muted)]"
				>
					<kbd className="rounded border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[var(--gb-text)] shadow-sm">
						{item.keyLabel}
					</kbd>
					<span className="text-[var(--gb-text)]">{item.action}</span>
				</span>
			))}
		</div>
	);
}
