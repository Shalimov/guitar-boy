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
