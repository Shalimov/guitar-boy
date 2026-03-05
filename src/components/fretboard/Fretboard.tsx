import type { FretboardProps } from "@/types";
import { CanvasFretboard } from "./CanvasFretboard";

export function Fretboard(props: FretboardProps) {
	return <CanvasFretboard {...props} />;
}
