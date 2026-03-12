import { shouldShowTip } from "./tipEngine";

describe("tipEngine", () => {
	const pos = { string: 0, fret: 1 }; // F
	const dismissed: string[] = [];

	it("returns null if error count is below threshold", () => {
		const tip = shouldShowTip("F", pos, 2, dismissed);
		expect(tip).toBeNull();
	});

	it("returns a tip if threshold reached and tip exists", () => {
		const tip = shouldShowTip("C", { string: 4, fret: 3 }, 3, dismissed);
		expect(tip).not.toBeNull();
		expect(tip?.id).toBe("tip-c-general");
	});

	it("returns a specific tip over a general one", () => {
		const tip = shouldShowTip("F", { string: 0, fret: 1 }, 3, dismissed);
		expect(tip?.id).toBe("tip-f-s0f1");
	});

	it("returns null if tip is already dismissed", () => {
		const tip = shouldShowTip("C", { string: 4, fret: 3 }, 3, ["tip-c-general"]);
		expect(tip).toBeNull();
	});

	it("returns null if no tip exists for the note", () => {
		const tip = shouldShowTip("XYZ", pos, 3, dismissed);
		expect(tip).toBeNull();
	});
});
