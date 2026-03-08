import { describe, expect, it } from "@jest/globals";
import {
	addDot,
	addGroup,
	clearDiagram,
	createDot,
	createGroup,
	findDotIndex,
	hasDotAt,
	isSamePosition,
	removeDotAt,
} from "./diagramState";

describe("isSamePosition", () => {
	it("returns true for same positions", () => {
		expect(isSamePosition({ string: 0, fret: 0 }, { string: 0, fret: 0 })).toBe(true);
	});

	it("returns false for different strings", () => {
		expect(isSamePosition({ string: 0, fret: 0 }, { string: 1, fret: 0 })).toBe(false);
	});

	it("returns false for different frets", () => {
		expect(isSamePosition({ string: 0, fret: 0 }, { string: 0, fret: 5 })).toBe(false);
	});
});

describe("createDot", () => {
	it("creates a dot with default values", () => {
		const dot = createDot({ string: 0, fret: 5 });
		expect(dot.position).toEqual({ string: 0, fret: 5 });
		expect(dot.color).toBe("#3B82F6");
		expect(dot.shape).toBe("circle");
	});

	it("creates a dot with custom options", () => {
		const dot = createDot({ string: 0, fret: 5 }, { label: "A", color: "red", shape: "square" });
		expect(dot.label).toBe("A");
		expect(dot.color).toBe("red");
		expect(dot.shape).toBe("square");
	});
});

describe("createGroup", () => {
	it("creates a group with given positions and color", () => {
		const group = createGroup(
			[
				{ string: 0, fret: 0 },
				{ string: 1, fret: 2 },
			],
			"#FF0000",
		);
		expect(group.positions).toHaveLength(2);
		expect(group.color).toBe("#FF0000");
		expect(group.id).toBeDefined();
	});
});

describe("findDotIndex", () => {
	it("returns index when dot exists", () => {
		const dots = [{ position: { string: 0, fret: 0 } }, { position: { string: 1, fret: 2 } }];
		expect(findDotIndex(dots, { string: 1, fret: 2 })).toBe(1);
	});

	it("returns -1 when dot does not exist", () => {
		const dots = [{ position: { string: 0, fret: 0 } }];
		expect(findDotIndex(dots, { string: 1, fret: 2 })).toBe(-1);
	});
});

describe("hasDotAt", () => {
	it("returns true when dot exists at position", () => {
		const dots = [{ position: { string: 0, fret: 0 } }];
		expect(hasDotAt(dots, { string: 0, fret: 0 })).toBe(true);
	});

	it("returns false when dot does not exist at position", () => {
		const dots = [{ position: { string: 0, fret: 0 } }];
		expect(hasDotAt(dots, { string: 1, fret: 2 })).toBe(false);
	});
});

describe("removeDotAt", () => {
	it("removes dot at position", () => {
		const state = {
			dots: [{ position: { string: 0, fret: 0 } }, { position: { string: 1, fret: 2 } }],
			lines: [],
		};
		const result = removeDotAt(state, { string: 0, fret: 0 });
		expect(result.dots).toHaveLength(1);
		expect(result.dots[0].position).toEqual({ string: 1, fret: 2 });
	});

	it("returns same state when dot does not exist", () => {
		const state = {
			dots: [{ position: { string: 0, fret: 0 } }],
			lines: [],
		};
		const result = removeDotAt(state, { string: 1, fret: 2 });
		expect(result.dots).toHaveLength(1);
	});
});

describe("addDot", () => {
	it("adds a dot to the state", () => {
		const state = { dots: [], lines: [] };
		const dot = { position: { string: 0, fret: 0 }, color: "blue" };
		const result = addDot(state, dot);
		expect(result.dots).toHaveLength(1);
		expect(result.dots[0]).toEqual(dot);
	});
});

describe("addGroup", () => {
	it("adds a group to the state", () => {
		const state = { dots: [], lines: [], groups: [] };
		const group = { id: "test", positions: [], color: "red", strokeWidth: 2 };
		const result = addGroup(state, group);
		expect(result.groups).toHaveLength(1);
	});
});

describe("clearDiagram", () => {
	it("returns empty state", () => {
		const result = clearDiagram();
		expect(result.dots).toEqual([]);
		expect(result.lines).toEqual([]);
		expect(result.groups).toEqual([]);
	});
});
