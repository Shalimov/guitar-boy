import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

window.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

import { TextDecoder, TextEncoder } from "node:util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

if (typeof global.Request === "undefined") {
	class MockRequest {
		url: string;
		method: string;
		headers: Headers;
		signal: AbortSignal | null;
		body: BodyInit | null;

		constructor(input: string | URL, init: RequestInit = {}) {
			this.url = String(input);
			this.method = init.method ?? "GET";
			this.headers = new Headers(init.headers);
			this.signal = init.signal ?? null;
			this.body = init.body ?? null;
		}

		clone() {
			return new MockRequest(this.url, {
				method: this.method,
				headers: this.headers,
				signal: this.signal ?? undefined,
				body: this.body ?? undefined,
			});
		}
	}

	global.Request = MockRequest as typeof Request;
}

const defaultCanvasContext = {
	clearRect: jest.fn(),
	fillRect: jest.fn(),
	beginPath: jest.fn(),
	moveTo: jest.fn(),
	lineTo: jest.fn(),
	stroke: jest.fn(),
	fill: jest.fn(),
	arc: jest.fn(),
	rect: jest.fn(),
	setLineDash: jest.fn(),
	save: jest.fn(),
	restore: jest.fn(),
	translate: jest.fn(),
	rotate: jest.fn(),
	fillText: jest.fn(),
	setTransform: jest.fn(),
	strokeStyle: "",
	fillStyle: "",
	lineWidth: 1,
	font: "",
	textAlign: "left",
	textBaseline: "alphabetic",
} as unknown as CanvasRenderingContext2D;

HTMLCanvasElement.prototype.getContext = jest.fn(
	() => defaultCanvasContext,
) as unknown as HTMLCanvasElement["getContext"];
