import { addDays, getToday, isToday } from "./date";

describe("addDays", () => {
	it("adds positive days", () => {
		expect(addDays("2026-03-04", 1)).toBe("2026-03-05");
		expect(addDays("2026-03-04", 7)).toBe("2026-03-11");
		expect(addDays("2026-03-31", 1)).toBe("2026-04-01");
	});

	it("handles negative days", () => {
		expect(addDays("2026-03-04", -1)).toBe("2026-03-03");
		expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
	});

	it("handles Date objects", () => {
		const date = new Date("2026-03-04");
		expect(addDays(date, 1)).toBe("2026-03-05");
	});
});

describe("isToday", () => {
	it("returns true for today", () => {
		const today = new Date().toISOString().split("T")[0];
		expect(isToday(today)).toBe(true);
	});

	it("returns false for other dates", () => {
		expect(isToday("2025-01-01")).toBe(false);
	});
});

describe("getToday", () => {
	it("returns today's date in ISO format", () => {
		const today = new Date().toISOString().split("T")[0];
		expect(getToday()).toBe(today);
	});
});
