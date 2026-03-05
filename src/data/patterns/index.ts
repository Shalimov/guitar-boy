import type { Diagram } from "@/types";
import { cagedShapes } from "./caged";
import { intervalPatterns } from "./intervals";
import { majorScalePatterns } from "./major-scale";
import { pentatonicPatterns } from "./pentatonic";

export const allPatterns: Diagram[] = [
	...cagedShapes,
	...pentatonicPatterns,
	...majorScalePatterns,
	...intervalPatterns,
];
