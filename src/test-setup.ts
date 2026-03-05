import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

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
