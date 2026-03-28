import { useEffect, useState } from "react";
import { AnswerButton, NoteButtonGroup } from "./index";
import type { ShortcutItem } from "./KeyboardShortcutsBar";
import { KeyboardShortcutsBar } from "./KeyboardShortcutsBar";

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
							<AnswerButton
								key={note}
								note={note}
								selected={selectedNote === note}
								correct={showFeedback && correctNote === note}
								revealed={showFeedback}
								disabled={disabled}
								variant="class"
								onSelect={onNoteSelect}
								buttonClassName="py-3 px-4 rounded-lg font-bold border transition-all focus-visible:outline-none hover:opacity-90 active:scale-95 disabled:cursor-not-allowed"
							/>
						))}
					</NoteButtonGroup>
				))}
			</div>
		</div>
	);
}
