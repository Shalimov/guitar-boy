import type { Diagram } from "@/types";
import { cagedShapes } from "./caged";
import { intervalPatterns } from "./intervals";
import { majorScalePatterns } from "./major-scale";
import { minorScalePatterns } from "./minor-scale";
import { pentatonicPatterns } from "./pentatonic";

export const allPatterns: Diagram[] = [
	...cagedShapes,
	...pentatonicPatterns,
	...majorScalePatterns,
	...minorScalePatterns,
	...intervalPatterns,
];
