import type { CSSProperties } from "react";
import { NoteButtonGroup } from "./NoteButtonGroup";

export type AnswerButtonVariant = "style" | "class";

interface AnswerButtonProps {
	note: string;
	selected: boolean;
	correct?: boolean;
	revealed?: boolean;
	disabled?: boolean;
	variant?: AnswerButtonVariant;
	onSelect: (note: string) => void;
	keyboardHint?: string;
	buttonClassName?: string;
}

const CORRECT_COLOR = "#16a34a";
const INCORRECT_COLOR = "#dc2626";
const CORRECT_BORDER = "#14532d";
const INCORRECT_BORDER = "#7f1d1d";

function getStyles(selected: boolean, correct: boolean, revealed: boolean): CSSProperties {
	const isSelected = selected;
	const isCorrectNote = correct;
	const isIncorrect = revealed && isSelected && !isCorrectNote;

	let styles: CSSProperties = {
		background: "var(--gb-bg-panel)",
		color: "var(--gb-text)",
		borderColor: "var(--gb-border)",
		borderBottomWidth: "4px",
	};

	if (revealed && isCorrectNote) {
		styles = {
			background: CORRECT_COLOR,
			color: "#fff",
			borderColor: CORRECT_BORDER,
			borderBottomWidth: "4px",
		};
	} else if (isIncorrect) {
		styles = {
			background: INCORRECT_COLOR,
			color: "#fff",
			borderColor: INCORRECT_BORDER,
			borderBottomWidth: "4px",
		};
	} else if (isSelected) {
		styles = {
			background: "var(--gb-accent)",
			color: "#fff8ee",
			borderColor: "var(--gb-accent-strong)",
			borderBottomWidth: "2px",
			transform: "translateY(2px)",
		};
	}

	return styles;
}

function getClassNames(
	selected: boolean,
	correct: boolean,
	revealed: boolean,
	buttonClassName: string,
	disabled: boolean,
): string {
	const isSelected = selected;
	const isCorrectNote = correct;
	const isIncorrect = revealed && isSelected && !isCorrectNote;

	let styleClass = "bg-[var(--gb-bg-panel)] text-[var(--gb-text)] border-[var(--gb-border)]";
	let activeClass = "hover:opacity-90 active:scale-95";

	if (revealed && isCorrectNote) {
		styleClass = "bg-green-600 text-white border-transparent";
		activeClass = "";
	} else if (isIncorrect) {
		styleClass = "bg-red-600 text-white border-transparent";
		activeClass = "";
	} else if (isSelected) {
		styleClass = "bg-[var(--gb-accent)] text-white border-transparent";
		activeClass = "";
	}

	return `relative rounded-xl border-x border-t font-bold transition-all focus-visible:outline-none ${buttonClassName} ${styleClass} ${disabled ? "cursor-not-allowed opacity-90" : activeClass}`;
}

export function AnswerButton({
	note,
	selected,
	correct = false,
	revealed = false,
	disabled = false,
	variant = "style",
	onSelect,
	keyboardHint,
	buttonClassName = "py-2 text-base",
}: AnswerButtonProps) {
	const handleClick = () => {
		if (!disabled) {
			onSelect(note);
		}
	};

	if (variant === "class") {
		return (
			<button
				type="button"
				onClick={handleClick}
				disabled={disabled}
				className={getClassNames(selected, correct, revealed, buttonClassName, disabled)}
			>
				{note}
			</button>
		);
	}

	const styles = getStyles(selected, correct, revealed);

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={disabled}
			style={styles}
			className={`relative rounded-xl border-x border-t font-bold transition-all focus-visible:outline-none ${buttonClassName} ${disabled ? "cursor-not-allowed opacity-90" : "hover:brightness-95 active:translate-y-0.5 active:border-b-2"}`}
		>
			{note}
			{keyboardHint ? (
				<kbd className="absolute bottom-1 right-1.5 rounded bg-[var(--gb-bg-elev)] px-1 py-0.5 font-mono text-[9px] font-medium text-[var(--gb-text-muted)] opacity-70">
					{keyboardHint}
				</kbd>
			) : null}
		</button>
	);
}

export interface NoteGroup {
	label: string;
	notes: string[];
}

interface NoteSelectionGridProps {
	groups: NoteGroup[];
	selectedNote: string | null;
	correctNote: string | null;
	revealed: boolean;
	onSelect: (note: string) => void;
	keyDisplayMap?: Record<string, string | undefined>;
	disabled?: boolean;
	variant?: AnswerButtonVariant;
	buttonClassName?: string;
}

export function NoteSelectionGrid({
	groups,
	selectedNote,
	correctNote,
	revealed,
	onSelect,
	keyDisplayMap,
	disabled = false,
	variant = "style",
	buttonClassName = "py-3 px-4 rounded-lg font-bold border transition-all",
}: NoteSelectionGridProps) {
	return (
		<div className="space-y-4">
			{groups.map((group) => (
				<NoteButtonGroup key={group.label} label={group.label}>
					{group.notes.map((note) => (
						<AnswerButton
							key={note}
							note={note}
							selected={selectedNote === note}
							correct={revealed && note === correctNote}
							revealed={revealed}
							disabled={disabled}
							variant={variant}
							onSelect={onSelect}
							keyboardHint={keyDisplayMap?.[note]}
							buttonClassName={buttonClassName}
						/>
					))}
				</NoteButtonGroup>
			))}
		</div>
	);
}
