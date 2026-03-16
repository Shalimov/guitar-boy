import { useMemo } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { addDays, getToday } from "@/lib/date";

interface StreakDisplayProps {
	currentStreak: number;
	longestStreak: number;
	/** YYYY-MM-DD strings of active days for the heat map */
	activeDays: string[];
}

export function StreakDisplay({ currentStreak, longestStreak, activeDays }: StreakDisplayProps) {
	const last364Days = useMemo(() => {
		const days = [];
		const today = getToday();
		// Start from 363 days ago to today (total 364 days = 52 weeks = 1 year)
		for (let i = 363; i >= 0; i--) {
			days.push(addDays(today, -i));
		}
		return days;
	}, []);

	// Group days into columns (weeks), where each column has 7 rows (days)
	const columns = [];
	for (let i = 0; i < last364Days.length; i += 7) {
		columns.push(last364Days.slice(i, i + 7));
	}

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	return (
		<div
			className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4 shadow-[var(--gb-shadow-soft)] relative"
			data-testid="streak-display"
		>
			<div
				aria-hidden
				className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(232,180,141,0.25),_transparent_70%)]"
			/>

			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div className="flex items-center gap-3 shrink-0">
					<span className="text-2xl" role="img" aria-label="flame">
						🔥
					</span>
					<div>
						<div className="flex items-baseline gap-2">
							<span className="text-2xl font-extrabold text-[var(--gb-accent)]">
								{currentStreak}
							</span>
							<span className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
								Day Streak
							</span>
						</div>
						<p className="text-xs font-medium text-[var(--gb-text-muted)]">
							Best: <span className="text-[var(--gb-text)]">{longestStreak} days</span>
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5 justify-end flex-1">
					{columns.map((column, _colIndex) => (
						<div key={column[0]} className="flex flex-col gap-1">
							{column.map((date) => {
								const isActive = activeDays.includes(date);
								return (
									<Tooltip key={date} content={formatDate(date)}>
										<div
											className="w-3.5 h-3.5 rounded-[4px] transition-colors cursor-help"
											style={{
												background: isActive ? "var(--gb-accent)" : "var(--gb-bg-panel)",
												opacity: isActive ? 1 : 0.6,
											}}
										/>
									</Tooltip>
								);
							})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
