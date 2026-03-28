import { AnswerButton, type NoteGroup } from "./AnswerButton";
import { NoteButtonGroup } from "./NoteButtonGroup";

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
	useGroups?: boolean;
}

function getNoteGroup(note: string): string {
	if (note.includes("#")) return "Sharps";
	if (note.includes("b")) return "Flats";
	return "Natural Notes";
}

function groupNotes(notes: readonly string[]): Map<string, string[]> {
	const groups = new Map<string, string[]>();
	const order = ["Natural Notes", "Sharps", "Flats"];

	for (const orderKey of order) {
		groups.set(orderKey, []);
	}

	for (const note of notes) {
		const group = getNoteGroup(note);
		const existing = groups.get(group) || [];
		groups.set(group, [...existing, note]);
	}

	return groups;
}

function buildGroups(notes: readonly string[]): NoteGroup[] {
	const groupedNotes = groupNotes(notes);
	const result: NoteGroup[] = [];

	for (const [label, groupNotesList] of groupedNotes) {
		if (groupNotesList.length > 0) {
			result.push({ label, notes: groupNotesList });
		}
	}

	return result;
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
	useGroups = true,
}: NoteButtonGridProps) {
	if (!useGroups || notes.length <= 7) {
		return (
			<div className={gridClassName}>
				{notes.map((note) => (
					<AnswerButton
						key={note}
						note={note}
						selected={selectedNote === note}
						correct={revealed && note === correctNote}
						revealed={revealed}
						disabled={disabled}
						variant="style"
						onSelect={onSelect}
						keyboardHint={keyDisplayMap?.[note]}
						buttonClassName={buttonClassName}
					/>
				))}
			</div>
		);
	}

	const groups = buildGroups(notes);

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
							variant="style"
							onSelect={onSelect}
							keyboardHint={keyDisplayMap?.[note]}
							buttonClassName="py-2 text-base"
						/>
					))}
				</NoteButtonGroup>
			))}
		</div>
	);
}
