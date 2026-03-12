import { useMemo } from "react";
import { addDays, getToday } from "@/lib/date";

interface StreakDisplayProps {
	currentStreak: number;
	longestStreak: number;
	/** YYYY-MM-DD strings of active days for the heat map */
	activeDays: string[];
}

export function StreakDisplay({ currentStreak, longestStreak, activeDays }: StreakDisplayProps) {
	const last28Days = useMemo(() => {
		const days = [];
		const today = getToday();
		// Start from 27 days ago to today (total 28 days)
		for (let i = 27; i >= 0; i--) {
			days.push(addDays(today, -i));
		}
		return days;
	}, []);

	const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

	// Group days into weeks (starting from Monday if possible, or just chunks of 7)
	const weeks = [];
	for (let i = 0; i < last28Days.length; i += 7) {
		weeks.push(last28Days.slice(i, i + 7));
	}

	return (
		<div
			className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 shadow-[var(--gb-shadow-soft)] overflow-hidden relative"
			data-testid="streak-display"
		>
			<div
				aria-hidden
				className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(232,180,141,0.25),_transparent_70%)]"
			/>

			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-3xl" role="img" aria-label="flame">
							🔥
						</span>
						<span className="text-3xl font-extrabold text-[var(--gb-accent)]">{currentStreak}</span>
						<span className="text-sm font-bold uppercase tracking-wider text-[var(--gb-text-muted)] self-end mb-1">
							Day Streak
						</span>
					</div>
					<p className="text-xs font-medium text-[var(--gb-text-muted)]">
						Best: <span className="text-[var(--gb-text)]">{longestStreak} days</span>
					</p>
				</div>

				<div className="space-y-2">
					<div className="grid grid-cols-7 gap-1">
						{dayLabels.map((label, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: Static labels that never change order
								key={`${label}-${i}`}
								className="text-[10px] font-bold text-center text-[var(--gb-text-muted)] w-4"
							>
								{label}
							</div>
						))}
						{last28Days.map((date) => {
							const isActive = activeDays.includes(date);
							return (
								<div
									key={date}
									title={date}
									className="w-4 h-4 rounded-sm transition-colors"
									style={{
										background: isActive ? "var(--gb-accent)" : "var(--gb-bg-panel)",
										opacity: isActive ? 1 : 0.4,
									}}
								/>
							);
						})}
					</div>
					<p className="text-[10px] text-right font-bold uppercase tracking-widest text-[var(--gb-text-muted)]">
						Last 28 Days
					</p>
				</div>
			</div>
		</div>
	);
}
