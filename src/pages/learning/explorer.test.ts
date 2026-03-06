import {
	buildExplorerFretboardState,
	type ExplorerState,
	getExplorerConstructFormula,
} from "./explorer";

const baseState: ExplorerState = {
	root: "C",
	constructType: "Scales",
	constructName: "Major",
	labelType: "notes",
	noteFilter: "all",
	accidentalPreference: "sharp",
	fretRange: [1, 5],
	showCagedOverlay: false,
	activeCagedShapes: ["C", "A", "G", "E", "D"],
};

describe("explorer helpers", () => {
	it("returns the formula for the selected construct", () => {
		expect(getExplorerConstructFormula(baseState)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
	});

	it("builds highlighted fretboard dots for the selected construct", () => {
		const fretboardState = buildExplorerFretboardState(baseState);

		expect(fretboardState.dots).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ label: "C", shape: "square" }),
				expect.objectContaining({ label: "D" }),
			]),
		);
	});

	it("uses interval labels when requested", () => {
		const fretboardState = buildExplorerFretboardState({
			...baseState,
			labelType: "intervals",
			constructName: "Mixolydian",
		});

		expect(fretboardState.dots).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ label: "1", shape: "square" }),
				expect.objectContaining({ label: "b7" }),
			]),
		);
	});

	it("adds caged groups when overlay is enabled", () => {
		const fretboardState = buildExplorerFretboardState({
			...baseState,
			showCagedOverlay: true,
			activeCagedShapes: ["C", "A"],
		});

		expect(fretboardState.groups?.length).toBeGreaterThan(0);
	});

	it("filters the fretboard down to a selected construct note", () => {
		const fretboardState = buildExplorerFretboardState({
			...baseState,
			noteFilter: "E",
		});

		expect(fretboardState.dots.length).toBeGreaterThan(0);
		expect(fretboardState.dots.every((dot) => dot.label === "E")).toBe(true);
	});
});
