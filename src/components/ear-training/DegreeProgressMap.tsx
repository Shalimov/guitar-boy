import type { DegreeStats, EarStreak, MasteryLevel, ScaleDegree } from "@/types/earTraining";
import { DEGREE_LABELS, DEGREE_UNLOCK_ORDER, getDegreeMastery } from "@/types/earTraining";
import { getDegreeColor } from "@/lib/scaleDegreeColors";

interface DegreeProgressMapProps {
	unlockedDegrees: ScaleDegree[];
	degreeStats: Partial<Record<ScaleDegree, DegreeStats>>;
	streak?: EarStreak;
	totalSessions: number;
	className?: string;
}

const MASTERY_CONFIG: Record<MasteryLevel, { label: string; icon: string; ring: string }> = {
	none: { label: "", icon: "", ring: "" },
	bronze: { label: "Bronze", icon: "🥉", ring: "ring-2 ring-amber-600" },
	silver: { label: "Silver", icon: "🥈", ring: "ring-2 ring-gray-400" },
	gold: { label: "Gold", icon: "🥇", ring: "ring-2 ring-yellow-400" },
};

export function DegreeProgressMap({
	unlockedDegrees,
	degreeStats,
	streak,
	totalSessions,
	className = "",
}: DegreeProgressMapProps) {
	return (
		<div className={`space-y-4 ${className}`}>
			{/* Streak & stats header */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					{streak && streak.current > 0 && (
						<div className="flex items-center gap-1.5 rounded-full border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-3 py-1">
							<span className="text-lg">🔥</span>
							<span className="text-sm font-bold text-[var(--gb-accent)]">
								{streak.current}
							</span>
							<span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
								Day Streak
							</span>
						</div>
					)}
					{streak && streak.best > 0 && (
						<span className="text-xs text-[var(--gb-text-muted)]">
							Best: {streak.best} days
						</span>
					)}
				</div>
				<span className="text-xs text-[var(--gb-text-muted)]">
					{totalSessions} total sessions
				</span>
			</div>

			{/* Degree grid */}
			<div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
				{DEGREE_UNLOCK_ORDER.map((degree) => {
					const isUnlocked = unlockedDegrees.includes(degree);
					const stats = degreeStats[degree];
					const mastery = getDegreeMastery(stats);
					const accuracy =
						stats && stats.attempts > 0
							? Math.round((stats.correct / stats.attempts) * 100)
							: null;
					const color = getDegreeColor(degree);
					const config = MASTERY_CONFIG[mastery];

					return (
						<div
							key={degree}
							className={`relative flex flex-col items-center rounded-xl p-3 transition-all ${
								isUnlocked
									? `shadow-sm ${config.ring}`
									: "opacity-30 border border-dashed border-[var(--gb-border)]"
							}`}
							style={
								isUnlocked
									? { backgroundColor: `${color}20`, borderColor: color }
									: undefined
							}
						>
							{/* Mastery badge */}
							{mastery !== "none" && (
								<span className="absolute -right-1 -top-1 text-sm">
									{config.icon}
								</span>
							)}

							{/* Lock icon for locked degrees */}
							{!isUnlocked && (
								<span className="text-lg text-[var(--gb-text-muted)]">🔒</span>
							)}

							{/* Degree number */}
							<span
								className={`text-lg font-bold ${
									isUnlocked ? "text-[var(--gb-text)]" : "text-[var(--gb-text-muted)]"
								}`}
							>
								{degree}
							</span>

							{/* Solfege name */}
							<span className="text-[10px] font-medium text-[var(--gb-text-muted)]">
								{DEGREE_LABELS[degree]}
							</span>

							{/* Accuracy */}
							{isUnlocked && (
								<span
									className="mt-1 text-[11px] font-bold"
									style={{ color }}
								>
									{accuracy !== null ? `${accuracy}%` : "--"}
								</span>
							)}

							{/* Attempts count */}
							{isUnlocked && stats && (
								<span className="text-[8px] text-[var(--gb-text-muted)]">
									{stats.attempts} tries
								</span>
							)}
						</div>
					);
				})}
			</div>

			{/* Legend */}
			<div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-[var(--gb-text-muted)]">
				<span>🥉 70%+ (20 tries)</span>
				<span>🥈 85%+ (50 tries)</span>
				<span>🥇 95%+ (100 tries)</span>
			</div>
		</div>
	);
}
