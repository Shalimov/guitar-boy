import type { ScaleDegree } from "@/types/earTraining";

/** Color map for scale degrees (research-backed visual-auditory associations) */
export const SCALE_DEGREE_COLORS: Record<ScaleDegree, string> = {
	"1": "#3B82F6", // blue — home, stable
	b2: "#86EFAC", // light green
	"2": "#22C55E", // green — wants to move
	b3: "#BEF264", // lime
	"3": "#EAB308", // yellow — bright, happy
	"4": "#F97316", // orange — leaning
	b5: "#FB923C", // light orange
	"5": "#EF4444", // red — strong anchor
	b6: "#C084FC", // light purple
	"6": "#8B5CF6", // purple — gentle
	b7: "#F472B6", // light pink
	"7": "#EC4899", // pink — tense, pulling home
};

/** Get a Tailwind-compatible CSS variable or hex for a degree */
export function getDegreeColor(degree: ScaleDegree): string {
	return SCALE_DEGREE_COLORS[degree];
}
