import { useEffect, useState } from "react";

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

function parseKeyLabel(label: string): string[] {
	if (label.includes("+")) {
		return label.split("+");
	}
	return [label];
}

export function KeyboardShortcutsBar({
	items,
	title = "Shortcuts:",
	className = "",
}: KeyboardShortcutsBarProps) {
	const [activeModifiers, setActiveModifiers] = useState({ ctrl: false, shift: false });

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			setActiveModifiers({
				ctrl: e.ctrlKey,
				shift: e.shiftKey,
			});
		};

		const handleKeyUp = () => {
			setActiveModifiers({ ctrl: false, shift: false });
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	const getDisplayedItems = () => {
		if (!activeModifiers.ctrl && !activeModifiers.shift) {
			return items;
		}

		return items.map((item) => {
			const keys = parseKeyLabel(item.keyLabel);
			const hasCtrl = keys.some((k) => k === "Ctrl");
			const hasShift = keys.some((k) => k === "Shift");

			// If modifiers are active and this item requires them, keep it
			if ((activeModifiers.ctrl && hasCtrl) || (activeModifiers.shift && hasShift)) {
				return item;
			}

			// Otherwise filter it out
			return null;
		});
	};

	const displayedItems = getDisplayedItems().filter((item) => item !== null) as ShortcutItem[];

	return (
		<div
			className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-4 py-2 text-[10px] shadow-sm ${className}`}
		>
			<span className="font-semibold text-[var(--gb-text-muted)]">{title}</span>
			{displayedItems.length > 0 ? (
				displayedItems.map((item, itemIndex) => {
					const keys = parseKeyLabel(item.keyLabel);
					const itemKey = item.id ?? `shortcut-${item.keyLabel}-${item.action}-${itemIndex}`;
					return (
						<span
							key={itemKey}
							className="flex items-center gap-1 font-medium text-[var(--gb-text-muted)]"
						>
							<span className="flex items-center gap-0.5">
								{keys.map((key, keyIndex) => (
									<span key={`${itemKey}-${key}`} className="flex items-center">
										{keyIndex > 0 && <span className="text-[var(--gb-text-muted)] mx-0.5">+</span>}
										<kbd className="rounded border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[var(--gb-text)] shadow-sm">
											{key}
										</kbd>
									</span>
								))}
							</span>
							<span className="text-[var(--gb-text)]">{item.action}</span>
						</span>
					);
				})
			) : (
				<span className="text-[var(--gb-text-muted)]">
					{activeModifiers.ctrl ? "Ctrl" : activeModifiers.shift ? "Shift" : ""} - No shortcuts
				</span>
			)}
		</div>
	);
}
