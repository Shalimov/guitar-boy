import type {
	ChordQuestion,
	IntervalQuestion,
	NoteGuessQuestion,
	NoteQuestion,
} from "@/pages/quiz/questions";
import type { SRSCard } from "@/types";
import { createOrUpdateSRSCard, deriveCardId } from "./srsCardFactory";

describe("deriveCardId", () => {
	it("derives ID for note question", () => {
		const q: NoteQuestion = {
			id: "q1",
			type: "note",
			targetNote: "C",
			targetString: 2,
			targetPositions: [],
		};
		expect(deriveCardId(q)).toBe("note:C:string2");
	});

	it("derives ID for note question without targetString", () => {
		const q: NoteQuestion = {
			id: "q1",
			type: "note",
			targetNote: "G",
			targetPositions: [],
		};
		expect(deriveCardId(q)).toBe("note:G:string0");
	});

	it("derives ID for note-guess question", () => {
		const q: NoteGuessQuestion = {
			id: "q2",
			type: "note-guess",
			targetNote: "E",
			shownPosition: { string: 4, fret: 5 },
			noteOptions: [],
		};
		expect(deriveCardId(q)).toBe("note:E:string4");
	});

	it("derives same ID for note-guess-sound as note-guess for same position", () => {
		const guess: NoteGuessQuestion = {
			id: "q2",
			type: "note-guess",
			targetNote: "A",
			shownPosition: { string: 1, fret: 0 },
			noteOptions: [],
		};
		const sound: NoteGuessQuestion = {
			id: "q3",
			type: "note-guess-sound",
			targetNote: "A",
			shownPosition: { string: 1, fret: 0 },
			noteOptions: [],
		};
		expect(deriveCardId(guess)).toBe(deriveCardId(sound));
	});

	it("derives ID for interval question", () => {
		const q: IntervalQuestion = {
			id: "q4",
			type: "interval",
			targetInterval: "M3",
			targetPositions: [],
			intervalOptions: [],
		};
		expect(deriveCardId(q)).toBe("interval:M3");
	});

	it("derives ID for chord question", () => {
		const q: ChordQuestion = {
			id: "q5",
			type: "chord",
			targetChord: "C major",
			targetPositions: [],
		};
		expect(deriveCardId(q)).toBe("chord:C major");
	});
});

describe("createOrUpdateSRSCard", () => {
	const noteQuestion: NoteQuestion = {
		id: "q1",
		type: "note",
		targetNote: "C",
		targetString: 0,
		targetStringLabel: "E",
		targetPositions: [],
	};

	it("creates a new card on correct answer", () => {
		const card = createOrUpdateSRSCard(noteQuestion, true, undefined);
		expect(card.id).toBe("note:C:string0");
		expect(card.category).toBe("note");
		expect(card.subCategory).toBe("Note C on E string");
		expect(card.repetitions).toBe(1);
		expect(card.intervalDays).toBe(1);
		expect(card.easeFactor).toBe(2.5);
		expect(card.lastAccuracy).toBe(0.8);
	});

	it("creates a new card on incorrect answer", () => {
		const card = createOrUpdateSRSCard(noteQuestion, false, undefined);
		expect(card.id).toBe("note:C:string0");
		expect(card.repetitions).toBe(0);
		expect(card.intervalDays).toBe(1);
		expect(card.easeFactor).toBe(2.3);
		expect(card.lastAccuracy).toBe(0);
	});

	it("updates an existing card preserving history", () => {
		const existing: SRSCard = {
			id: "note:C:string0",
			category: "note",
			subCategory: "Note C on E string",
			easeFactor: 2.6,
			intervalDays: 6,
			repetitions: 2,
			nextReviewAt: "2026-01-01",
			lastAccuracy: 0.8,
		};

		const card = createOrUpdateSRSCard(noteQuestion, true, existing);
		expect(card.easeFactor).toBe(2.6);
		expect(card.repetitions).toBe(3);
		expect(card.intervalDays).toBe(Math.round(6 * 2.6));
	});

	it("resets existing card on incorrect answer", () => {
		const existing: SRSCard = {
			id: "note:C:string0",
			category: "note",
			subCategory: "Note C on E string",
			easeFactor: 2.6,
			intervalDays: 15,
			repetitions: 3,
			nextReviewAt: "2026-01-01",
			lastAccuracy: 0.8,
		};

		const card = createOrUpdateSRSCard(noteQuestion, false, existing);
		expect(card.repetitions).toBe(0);
		expect(card.intervalDays).toBe(1);
		expect(card.easeFactor).toBe(2.4);
	});

	it("derives subCategory for interval question", () => {
		const q: IntervalQuestion = {
			id: "q1",
			type: "interval",
			targetInterval: "P5",
			targetPositions: [],
			intervalOptions: [],
		};
		const card = createOrUpdateSRSCard(q, true, undefined);
		expect(card.subCategory).toBe("P5");
		expect(card.category).toBe("interval");
	});

	it("derives subCategory for chord question", () => {
		const q: ChordQuestion = {
			id: "q1",
			type: "chord",
			targetChord: "G major",
			targetPositions: [],
		};
		const card = createOrUpdateSRSCard(q, true, undefined);
		expect(card.subCategory).toBe("G major");
		expect(card.category).toBe("chord");
	});
});
