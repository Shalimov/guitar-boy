import { act, renderHook } from "@testing-library/react";
import type { Diagram } from "@/types";
import { useDiagramStore } from "./useDiagramStore";

describe("useDiagramStore", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	const createDiagram = (id: string, isBuiltIn = false): Diagram => ({
		id,
		name: `Diagram ${id}`,
		createdAt: "2026-03-04T00:00:00Z",
		updatedAt: "2026-03-04T00:00:00Z",
		fretboardState: {
			dots: [],
			lines: [],
		},
		isBuiltIn,
	});

	it("returns initial store", () => {
		const { result } = renderHook(() => useDiagramStore());
		expect(result.current.store.version).toBe(1);
		expect(result.current.store.diagrams).toEqual([]);
	});

	it("adds a diagram", () => {
		const { result } = renderHook(() => useDiagramStore());
		const diagram = createDiagram("test-1");

		act(() => {
			result.current.addDiagram(diagram);
		});

		expect(result.current.store.diagrams).toHaveLength(1);
		expect(result.current.store.diagrams[0]).toEqual(diagram);
	});

	it("updates a diagram", () => {
		const { result } = renderHook(() => useDiagramStore());
		const diagram = createDiagram("test-1");

		act(() => {
			result.current.addDiagram(diagram);
		});

		const updated = { ...diagram, name: "Updated Diagram" };
		act(() => {
			result.current.updateDiagram(updated);
		});

		expect(result.current.store.diagrams[0].name).toBe("Updated Diagram");
	});

	it("deletes a user diagram", () => {
		const { result } = renderHook(() => useDiagramStore());
		const diagram = createDiagram("test-1", false);

		act(() => {
			result.current.addDiagram(diagram);
		});

		act(() => {
			result.current.deleteDiagram("test-1");
		});

		expect(result.current.store.diagrams).toHaveLength(0);
	});

	it("cannot delete built-in diagrams", () => {
		const { result } = renderHook(() => useDiagramStore());
		const diagram = createDiagram("builtin-1", true);

		act(() => {
			result.current.addDiagram(diagram);
		});

		act(() => {
			result.current.deleteDiagram("builtin-1");
		});

		expect(result.current.store.diagrams).toHaveLength(1);
	});

	it("gets a diagram by ID", () => {
		const { result } = renderHook(() => useDiagramStore());
		const diagram = createDiagram("test-1");

		act(() => {
			result.current.addDiagram(diagram);
		});

		expect(result.current.getDiagram("test-1")).toEqual(diagram);
		expect(result.current.getDiagram("nonexistent")).toBeUndefined();
	});

	it("separates user and built-in diagrams", () => {
		const { result } = renderHook(() => useDiagramStore());
		const userDiagram = createDiagram("user-1", false);
		const builtInDiagram = createDiagram("builtin-1", true);

		act(() => {
			result.current.addDiagram(userDiagram);
		});

		act(() => {
			result.current.addDiagram(builtInDiagram);
		});

		const userDiagrams = result.current.getUserDiagrams();
		const builtInDiagrams = result.current.getBuiltInDiagrams();

		expect(userDiagrams).toHaveLength(1);
		expect(userDiagrams[0].id).toBe("user-1");

		expect(builtInDiagrams).toHaveLength(1);
		expect(builtInDiagrams[0].id).toBe("builtin-1");
	});
});
