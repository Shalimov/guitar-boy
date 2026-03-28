import { getDegreeColor } from "@/lib/scaleDegreeColors";
import type { ScaleDegree } from "@/types/earTraining";
import { DEGREE_LABELS, DEGREE_UNLOCK_ORDER } from "@/types/earTraining";

interface PitchLadderProps {
	/** Currently highlighted degree (the one being played) */
	highlightDegree?: ScaleDegree | null;
	/** Which degrees are unlocked */
	unlockedDegrees: ScaleDegree[];
	/** Whether to show solfege labels */
	showLabels?: boolean;
	className?: string;
}

/**
 * Vertical pitch visualization showing scale degrees as colored rungs.
 * Root at bottom, 7th at top. Highlights the current played degree.
 */
export function PitchLadder({
	highlightDegree,
	unlockedDegrees,
	showLabels = true,
	className = "",
}: PitchLadderProps) {
	// Display all degrees from high (7) to low (1)
	const degreesTopToBottom = [...DEGREE_UNLOCK_ORDER].sort((a, b) => {
		const semitones: Record<ScaleDegree, number> = {
			"1": 0,
			b2: 1,
			"2": 2,
			b3: 3,
			"3": 4,
			"4": 5,
			b5: 6,
			"5": 7,
			b6: 8,
			"6": 9,
			b7: 10,
			"7": 11,
		};
		return semitones[b] - semitones[a];
	});

	return (
		<div className={`flex flex-col gap-1 ${className}`}>
			{degreesTopToBottom.map((degree) => {
				const isUnlocked = unlockedDegrees.includes(degree);
				const isHighlighted = highlightDegree === degree;
				const color = getDegreeColor(degree);

				return (
					<div
						key={degree}
						className={`flex items-center gap-2 rounded-md px-2 py-1 transition-all duration-200 ${
							isHighlighted ? "ring-2 ring-white/60 shadow-lg scale-105" : ""
						} ${!isUnlocked ? "opacity-20" : ""}`}
						style={{
							backgroundColor: isHighlighted
								? color
								: isUnlocked
									? `${color}33`
									: "var(--gb-bg-elev)",
						}}
					>
						{/* Degree indicator dot */}
						<div
							className={`h-3 w-3 rounded-full shrink-0 transition-all ${
								isHighlighted ? "scale-125" : ""
							}`}
							style={{
								backgroundColor: isUnlocked ? color : "var(--gb-text-muted)",
								opacity: isUnlocked ? 1 : 0.3,
							}}
						/>

						{/* Label */}
						<span
							className={`text-[11px] font-bold min-w-[18px] ${
								isHighlighted ? "text-white" : "text-[var(--gb-text)]"
							} ${!isUnlocked ? "text-[var(--gb-text-muted)]" : ""}`}
						>
							{degree}
						</span>

						{showLabels && isUnlocked && (
							<span
								className={`text-[10px] ${
									isHighlighted ? "text-white/80" : "text-[var(--gb-text-muted)]"
								}`}
							>
								{DEGREE_LABELS[degree]}
							</span>
						)}
					</div>
				);
			})}
		</div>
	);
}
