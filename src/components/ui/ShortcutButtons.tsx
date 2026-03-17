import { useEffect, useState } from "react";
import type { ShortcutItem } from "./KeyboardShortcutsBar";
import { KeyboardShortcutsBar } from "./KeyboardShortcutsBar";
import { NoteButtonGroup } from "./NoteButtonGroup";

interface ShortcutButtonsProps {
	items: readonly ShortcutItem[];
	noteGroups: {
		label: string;
		notes: string[];
	}[];
	selectedNote: string | null;
	onNoteSelect: (note: string) => void;
	disabled?: boolean;
	showFeedback?: boolean;
	correctNote?: string | null;
}

export function ShortcutButtons({
	items,
	noteGroups,
	selectedNote,
	onNoteSelect,
	disabled = false,
	showFeedback = false,
	correctNote = null,
}: ShortcutButtonsProps) {
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

	const getButtonStyle = (note: string) => {
		const isSelected = selectedNote === note;
		const isCorrectNote = correctNote && note === correctNote;
		const isWrong = isSelected && !isCorrectNote;

		if (showFeedback && isCorrectNote) {
			return "bg-green-600 text-white border-transparent";
		}
		if (isWrong) {
			return "bg-red-600 text-white border-transparent";
		}
		if (isSelected) {
			return "bg-[var(--gb-accent)] text-white border-transparent";
		}
		return "bg-[var(--gb-bg-panel)] text-[var(--gb-text)] border-[var(--gb-border)]";
	};

	// Filter groups based on active modifiers
	const visibleGroups = noteGroups.filter((group) => {
		if (!activeModifiers.ctrl && !activeModifiers.shift) {
			return group.label === "Natural Notes";
		}
		if (activeModifiers.ctrl) {
			return group.label.includes("Sharps");
		}
		if (activeModifiers.shift) {
			return group.label.includes("Flats");
		}
		return false;
	});

	return (
		<div className="space-y-4">
			<KeyboardShortcutsBar items={items} className="mb-3" />
			<div className="space-y-4">
				{visibleGroups.map((group) => (
					<NoteButtonGroup key={group.label} label={group.label}>
						{group.notes.map((note) => (
							<button
								key={note}
								type="button"
								onClick={() => onNoteSelect(note)}
								disabled={disabled}
								className={`py-3 px-4 rounded-lg font-bold border transition-all focus-visible:outline-none hover:opacity-90 active:scale-95 disabled:cursor-not-allowed ${getButtonStyle(
									note,
								)} ${disabled ? "cursor-not-allowed" : ""}`}
							>
								{note}
							</button>
						))}
					</NoteButtonGroup>
				))}
			</div>
		</div>
	);
}
