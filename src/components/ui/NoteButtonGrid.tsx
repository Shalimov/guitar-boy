import type { CSSProperties } from "react";

interface NoteButtonGridProps {
	notes: readonly string[];
	selectedNote: string | null;
	correctNote: string | null;
	revealed: boolean;
	onSelect: (note: string) => void;
	keyDisplayMap?: Record<string, string | undefined>;
	disabled?: boolean;
	gridClassName?: string;
	buttonClassName?: string;
}

export function NoteButtonGrid({
	notes,
	selectedNote,
	correctNote,
	revealed,
	onSelect,
	keyDisplayMap,
	disabled = false,
	gridClassName = "grid grid-cols-4 gap-2",
	buttonClassName = "py-2 text-base",
}: NoteButtonGridProps) {
	return (
		<div className={gridClassName}>
			{notes.map((note) => {
				const isSelected = selectedNote === note;
				const isCorrect = revealed && note === correctNote;
				const isIncorrect = revealed && isSelected && note !== correctNote;

				let styles: CSSProperties = {
					background: "var(--gb-bg-panel)",
					color: "var(--gb-text)",
					borderColor: "var(--gb-border)",
					borderBottomWidth: "4px",
				};
				let activeClass = "hover:brightness-95 active:translate-y-0.5 active:border-b-2";

				if (isCorrect) {
					styles = {
						background: "#16a34a",
						color: "#fff",
						borderColor: "#14532d",
						borderBottomWidth: "4px",
					};
					activeClass = "";
				} else if (isIncorrect) {
					styles = {
						background: "#dc2626",
						color: "#fff",
						borderColor: "#7f1d1d",
						borderBottomWidth: "4px",
					};
					activeClass = "";
				} else if (isSelected) {
					styles = {
						background: "var(--gb-accent)",
						color: "#fff8ee",
						borderColor: "var(--gb-accent-strong)",
						borderBottomWidth: "2px",
						transform: "translateY(2px)",
					};
					activeClass = "";
				}

				return (
					<button
						key={note}
						type="button"
						onClick={() => onSelect(note)}
						disabled={disabled}
						style={styles}
						className={`relative rounded-xl border-x border-t font-bold transition-all focus-visible:outline-none ${buttonClassName} ${disabled ? "cursor-not-allowed opacity-90" : activeClass}`}
					>
						{note}
						{keyDisplayMap?.[note] ? (
							<kbd className="absolute bottom-1 right-1.5 rounded bg-[var(--gb-bg-elev)] px-1 py-0.5 font-mono text-[9px] font-medium text-[var(--gb-text-muted)] opacity-70">
								{keyDisplayMap[note]}
							</kbd>
						) : null}
					</button>
				);
			})}
		</div>
	);
}
