import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useQuizTimer } from "@/hooks/useQuizTimer";

describe("useQuizTimer", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("starts with initial time", () => {
		const { result } = renderHook(() =>
			useQuizTimer({ enabled: true, seconds: 10, onTimeout: jest.fn() }),
		);
		expect(result.current.timeLeft).toBe(10);
	});

	it("does not start timer when disabled", () => {
		const { result } = renderHook(() =>
			useQuizTimer({ enabled: false, seconds: 10, onTimeout: jest.fn() }),
		);
		expect(result.current.timeLeft).toBe(10);
	});
});
