export interface Tip {
	id: string;
	/** Pattern: "note:C", "note:F:s0f1", "interval:M3" */
	triggerKey: string;
	title: string;
	body: string;
	mnemonic?: string;
}

export const TIPS: Tip[] = [
	{
		id: "tip-f-s0f1",
		triggerKey: "note:F:s0f1",
		title: "F on the high E string",
		body: "F is at fret 1 on the high E string — the very first fret. F# is one fret higher.",
		mnemonic: "First fret = F",
	},
	{
		id: "tip-c-general",
		triggerKey: "note:C",
		title: "Finding C quickly",
		body: "C appears at fret 3 of the A string and fret 1 of the B string. These are your C landmarks.",
		mnemonic: "C = 3rd fret A, 1st fret B",
	},
	{
		id: "tip-b-general",
		triggerKey: "note:B",
		title: "B is always near C",
		body: "B is always one fret below C. Know C? B is one fret toward the nut.",
		mnemonic: "B is before C",
	},
	{
		id: "tip-e-f",
		triggerKey: "note:E",
		title: "E and F are neighbors",
		body: "E→F is a half step (one fret). This is one of two natural half-step pairs (the other is B→C).",
		mnemonic: "EF = End of fret (only 1 fret apart)",
	},
	{
		id: "tip-g-s1f8",
		triggerKey: "note:G:s1f8",
		title: "G on the B string",
		body: "G is at fret 8 on the B string. It's often confused with F (fret 6) or A (fret 10).",
		mnemonic: "G = Great (fret) 8",
	},
	{
		id: "tip-d-general",
		triggerKey: "note:D",
		title: "D is between C and E",
		body: "D is always two frets above C and two frets below E. It's the center of the C-D-E block.",
	},
	{
		id: "tip-a-general",
		triggerKey: "note:A",
		title: "Open A and beyond",
		body: "A is the open 5th string. On other strings, it's often 2 frets above G.",
	},
	{
		id: "tip-sharp-flat",
		triggerKey: "sharps-flats",
		title: "Sharps and Flats",
		body: "Sharp (#) means one fret higher (right); Flat (b) means one fret lower (left).",
		mnemonic: "Sharp up, Flat back",
	},
];

export function findTip(note: string, position?: { string: number; fret: number }): Tip | null {
	if (position) {
		const specific = TIPS.find(
			(t) => t.triggerKey === `note:${note}:s${position.string}f${position.fret}`,
		);
		if (specific) return specific;
	}
	return TIPS.find((t) => t.triggerKey === `note:${note}`) ?? null;
}
