import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
	const KEY = "test-key";

	beforeEach(() => {
		localStorage.clear();
	});

	it("returns initial value when localStorage is empty", () => {
		const { result } = renderHook(() => useLocalStorage(KEY, { value: 1 }));
		expect(result.current[0]).toEqual({ value: 1 });
	});

	it("reads existing value from localStorage", () => {
		localStorage.setItem(KEY, JSON.stringify({ value: 42 }));
		const { result } = renderHook(() => useLocalStorage(KEY, { value: 1 }));
		expect(result.current[0]).toEqual({ value: 42 });
	});

	it("updates localStorage when value changes", () => {
		const { result, rerender } = renderHook(() => useLocalStorage(KEY, { value: 1 }));

		act(() => {
			result.current[1]({ value: 99 });
		});
		rerender();

		expect(result.current[0]).toEqual({ value: 99 });
		expect(JSON.parse(localStorage.getItem(KEY) || "")).toEqual({ value: 99 });
	});

	it("handles function updates", () => {
		const { result, rerender } = renderHook(() => useLocalStorage(KEY, { count: 0 }));

		act(() => {
			result.current[1]((prev) => ({ count: prev.count + 1 }));
		});
		rerender();

		expect(result.current[0]).toEqual({ count: 1 });
	});

	it("applies migration when version differs", () => {
		localStorage.setItem(KEY, JSON.stringify({ version: 1, data: "old" }));

		const migrate = jest.fn().mockReturnValue({ version: 2, data: "new" });
		const { result } = renderHook(() =>
			useLocalStorage(KEY, { version: 2, data: "initial" }, migrate),
		);

		expect(migrate).toHaveBeenCalledWith({ version: 1, data: "old" }, 1);
		expect(result.current[0]).toEqual({ version: 2, data: "new" });
	});

	it("handles JSON parse errors", () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation();
		localStorage.setItem(KEY, "invalid-json{");

		const { result } = renderHook(() => useLocalStorage(KEY, { value: 1 }));
		expect(result.current[0]).toEqual({ value: 1 });
		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});
});
