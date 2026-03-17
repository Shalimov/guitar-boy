import type { ShortcutItem } from "@/components/ui/KeyboardShortcutsBar";

interface BuildNoteShortcutOptions {
	notes: readonly string[];
	keyDisplayMap: Record<string, string | undefined>;
	includeSpaceAction?: string;
	includeEnterAction?: string;
	extra?: readonly ShortcutItem[];
}

export function buildNoteShortcutItems({
	notes,
	keyDisplayMap,
	includeSpaceAction,
	includeEnterAction,
	extra = [],
}: BuildNoteShortcutOptions): ShortcutItem[] {
	const noteItems: ShortcutItem[] = [];
	for (const note of notes) {
		const keyLabel = keyDisplayMap[note];
		if (!keyLabel) {
			continue;
		}
		noteItems.push({
			id: `note-${note}`,
			keyLabel,
			action: note,
		});
	}

	const systemItems: ShortcutItem[] = [
		...(includeSpaceAction ? [{ id: "space", keyLabel: "Space", action: includeSpaceAction }] : []),
		...(includeEnterAction ? [{ id: "enter", keyLabel: "Enter", action: includeEnterAction }] : []),
	];

	return [...noteItems, ...systemItems, ...extra];
}

export function buildSimpleShortcutItems(items: readonly ShortcutItem[]): ShortcutItem[] {
	return [...items];
}

export const NATURAL_NOTE_KEYS: Record<string, string> = {
	a: "A",
	b: "B",
	c: "C",
	d: "D",
	e: "E",
	f: "F",
	g: "G",
};

export const SHARP_NOTE_KEYS: Record<string, string> = {
	a: "A#",
	c: "C#",
	d: "D#",
	f: "F#",
	g: "G#",
};

export const FLAT_NOTE_KEYS: Record<string, string> = {
	b: "Bb",
	c: "Db",
	e: "Eb",
	f: "Gb",
	g: "Ab",
};

export const NATURAL_KEY_DISPLAY: Record<string, string> = {
	A: "A",
	B: "B",
	C: "C",
	D: "D",
	E: "E",
	F: "F",
	G: "G",
};

export const SHARP_KEY_DISPLAY: Record<string, string> = {
	"A#": "Ctrl+A",
	"C#": "Ctrl+C",
	"D#": "Ctrl+D",
	"F#": "Ctrl+F",
	"G#": "Ctrl+G",
};

export const FLAT_KEY_DISPLAY: Record<string, string> = {
	Bb: "Shift+B",
	Db: "Shift+C",
	Eb: "Shift+E",
	Gb: "Shift+F",
	Ab: "Shift+G",
};

export function buildChromaticKeyDisplayMap(includeFlats = false): Record<string, string> {
	const map: Record<string, string> = { ...NATURAL_KEY_DISPLAY, ...SHARP_KEY_DISPLAY };
	if (includeFlats) {
		Object.assign(map, FLAT_KEY_DISPLAY);
	}
	return map;
}

export function getNoteFromKeyEvent(event: KeyboardEvent, includeFlats = false): string | null {
	if (event.ctrlKey && event.shiftKey) {
		return null;
	}

	if (event.ctrlKey) {
		return SHARP_NOTE_KEYS[event.key.toLowerCase()] ?? null;
	}

	if (event.shiftKey && includeFlats) {
		return FLAT_NOTE_KEYS[event.key.toLowerCase()] ?? null;
	}

	return NATURAL_NOTE_KEYS[event.key.toLowerCase()] ?? null;
}
