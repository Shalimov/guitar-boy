import { useNavigate } from "react-router";
import { Button } from "@/components/ui";
import { useProgressStore } from "@/hooks/useProgressStore";
import { EMPTY_MISTAKE_LOG } from "@/lib/mistakeAnalysis";
import { computeStreak, getActiveDays } from "@/lib/streak";
import type { SessionRecord } from "@/types";
import { StreakDisplay } from "./StreakDisplay";
import { WeakSpotsPanel } from "./WeakSpotsPanel";

export function DashboardPage() {
	const navigate = useNavigate();
	const { store } = useProgressStore();
	const sessionHistory: SessionRecord[] = store.sessionHistory;

	const activeDays = getActiveDays(sessionHistory);
	const { currentStreak, longestStreak } = computeStreak(
		sessionHistory.map((s: SessionRecord) => s.date),
	);

	const sessionsToday = sessionHistory.filter(
		(session: SessionRecord) => new Date(session.date).toDateString() === new Date().toDateString(),
	).length;
	const recentSessions = sessionHistory.slice(0, 3);

	const notesSessions = sessionHistory.filter((s: SessionRecord) => s.mode === "quiz-note");
	const intervalSessions = sessionHistory.filter((s: SessionRecord) => s.mode === "quiz-interval");
	const chordSessions = sessionHistory.filter((s: SessionRecord) => s.mode === "quiz-chord");

	const calculateAccuracy = (sessions: SessionRecord[]) => {
		if (sessions.length === 0) return 0;
		const totalCorrect = sessions.reduce((sum: number, s: SessionRecord) => sum + s.correct, 0);
		const totalQuestions = sessions.reduce(
			(sum: number, s: SessionRecord) => sum + s.totalQuestions,
			0,
		);
		return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
	};

	const progressByMode = [
		{ label: "Notes", accuracy: calculateAccuracy(notesSessions) },
		{ label: "Intervals", accuracy: calculateAccuracy(intervalSessions) },
		{ label: "Chords", accuracy: calculateAccuracy(chordSessions) },
	];

	const weakestArea = [...progressByMode].sort((a, b) => a.accuracy - b.accuracy)[0];
	const hasDoneToday = sessionHistory.some(
		(s) =>
			new Date(s.date).toDateString() === new Date().toDateString() && s.mode === "daily-practice",
	);

	const primaryAction = !hasDoneToday
		? {
				label: "Start daily practice",
				description: "A personalized 5-minute session mixing review, quizzes, and ear training.",
				action: () => navigate("/practice"),
			}
		: sessionHistory.length === 0
			? {
					label: "Start your first lesson",
					description: "Build a foundation with a guided walkthrough before jumping into drills.",
					action: () => navigate("/learn"),
				}
			: {
					label: `Sharpen ${weakestArea.label.toLowerCase()}`,
					description: `${weakestArea.label} is your lowest accuracy area right now. A short quiz will tighten it up.`,
					action: () => navigate("/quiz"),
				};

	const secondaryAction =
		hasDoneToday && sessionHistory.length > 0
			? { label: "Open quiz studio", action: () => navigate("/quiz") }
			: sessionHistory.length === 0
				? { label: "Explore whiteboard", action: () => navigate("/whiteboard") }
				: { label: "Open quiz studio", action: () => navigate("/quiz") };

	const formatModeLabel = (mode: (typeof sessionHistory)[number]["mode"]) => {
		switch (mode) {
			case "quiz-note":
				return "Note quiz";
			case "quiz-interval":
				return "Interval quiz";
			case "quiz-chord":
				return "Chord quiz";
			case "review":
				return "Review";
			case "daily-practice":
				return "Daily practice";
			case "learning":
				return "Learning session";
			case "whiteboard":
				return "Whiteboard session";
			default:
				return mode;
		}
	};

	return (
		<div className="space-y-8">
			<header className="space-y-2 animate-gb-fade-in animate-gb-duration-300">
				<p className="gb-page-kicker">Practice Radar</p>
				<h1 className="gb-page-title">Dashboard</h1>
				<p className="max-w-2xl text-sm text-[var(--gb-text-muted)]">
					Track momentum across notes, intervals, and chords, then jump straight into your next
					focused session.
				</p>
			</header>

			{sessionHistory.length > 0 && (
				<div
					style={{ animationDelay: "80ms" }}
					className="animate-gb-slide-up animate-gb-duration-300"
				>
					<StreakDisplay
						currentStreak={currentStreak}
						longestStreak={longestStreak}
						activeDays={activeDays}
					/>
				</div>
			)}

			<section
				style={{ animationDelay: "160ms" }}
				className="gb-panel overflow-hidden animate-gb-slide-up animate-gb-duration-300"
			>
				<div className="grid gap-5 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-7">
					<div className="space-y-4">
						<div className="space-y-2">
							<p className="gb-page-kicker">Today</p>
							<h2 className="text-2xl font-semibold text-[var(--gb-text)]">
								Your next best session
							</h2>
							<p className="max-w-2xl text-sm text-[var(--gb-text-muted)]">
								{primaryAction.description}
							</p>
						</div>

						<div className="flex flex-wrap gap-3">
							<Button onClick={primaryAction.action}>{primaryAction.label}</Button>
							<Button variant="secondary" onClick={secondaryAction.action}>
								{secondaryAction.label}
							</Button>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
						{[
							{ label: "Sessions today", value: sessionsToday, detail: "practice blocks" },
							{
								label: "Tracked sessions",
								value: sessionHistory.length,
								detail: "recent history",
							},
						].map((stat) => (
							<div
								key={stat.label}
								className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)]/70 p-4"
							>
								<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
									{stat.label}
								</p>
								<div className="mt-2 text-3xl font-extrabold text-[var(--gb-accent)]">
									{stat.value}
								</div>
								<p className="mt-1 text-sm text-[var(--gb-text-muted)]">{stat.detail}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{recentSessions.length > 0 && (
				<section
					style={{ animationDelay: "240ms" }}
					className="gb-panel p-6 animate-gb-slide-up animate-gb-duration-300"
				>
					<div className="flex flex-wrap items-end justify-between gap-3">
						<div>
							<p className="gb-page-kicker">Recent Activity</p>
							<h2 className="text-2xl font-semibold text-[var(--gb-text)]">Momentum snapshot</h2>
						</div>
						<p className="text-sm text-[var(--gb-text-muted)]">
							Keep sessions short and frequent to improve recall.
						</p>
					</div>

					<div className="mt-5 grid gap-3 md:grid-cols-3">
						{recentSessions.map((session: SessionRecord) => (
							<div
								key={`${session.date}-${session.mode}`}
								className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)]/65 p-4"
							>
								<p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gb-text-muted)]">
									{formatModeLabel(session.mode)}
								</p>
								<p className="mt-2 text-2xl font-extrabold text-[var(--gb-text)]">
									{session.correct}/{session.totalQuestions}
								</p>
								<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
									{Math.round((session.correct / session.totalQuestions) * 100)}% correct
								</p>
							</div>
						))}
					</div>
				</section>
			)}

			<div
				style={{ animationDelay: "320ms" }}
				className="animate-gb-slide-up animate-gb-duration-300"
			>
				<WeakSpotsPanel mistakeLog={store.mistakeLog ?? EMPTY_MISTAKE_LOG} />
			</div>

			{sessionHistory.length === 0 && (
				<section
					style={{ animationDelay: "400ms" }}
					className="gb-panel px-6 py-10 md:px-10 animate-gb-slide-up animate-gb-duration-300"
				>
					<div className="max-w-3xl mx-auto text-center space-y-3">
						<p className="gb-page-kicker !text-[var(--gb-accent)]">Getting Started</p>
						<h2 className="text-3xl font-bold text-[var(--gb-text)]">Your Learning Roadmap</h2>
						<p className="text-[var(--gb-text-muted)]">
							We recommend this sequence to build an intuitive mental map of the guitar.
						</p>
					</div>

					<div className="mt-8 grid gap-4 max-w-4xl mx-auto md:grid-cols-2">
						{[
							{
								level: "Phase 1",
								title: "Natural Notes",
								desc: "Find all C, D, E, F, G, A, B notes without thinking.",
								action: () => navigate("/learn"),
								label: "Start Drills",
							},
							{
								level: "Phase 2",
								title: "Core Scales",
								desc: "Master Major, Minor, and Pentatonic shapes across the neck.",
								action: () => navigate("/whiteboard/patterns"),
								label: "View Patterns",
							},
							{
								level: "Phase 3",
								title: "Intervals",
								desc: "Connect notes by their relationships (3rds, 5ths, etc).",
								action: () => navigate("/quiz"),
								label: "Practice Now",
							},
							{
								level: "Phase 4",
								title: "Ear Training",
								desc: "Translate what you hear into what you play.",
								action: () => navigate("/quiz"),
								label: "Start Training",
							},
						].map((phase) => (
							<button
								type="button"
								key={phase.level}
								className="group flex flex-col justify-between text-left p-5 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] hover:shadow-[var(--gb-shadow-soft)] transition-all cursor-pointer"
								onClick={phase.action}
							>
								<div>
									<span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gb-accent)]">
										{phase.level}
									</span>
									<h3 className="mt-1 text-lg font-bold">{phase.title}</h3>
									<p className="mt-1.5 text-sm text-[var(--gb-text-muted)] leading-relaxed">
										{phase.desc}
									</p>
								</div>
								<div className="mt-4 flex items-center text-xs font-bold text-[var(--gb-accent)] group-hover:translate-x-1 transition-transform">
									{phase.label} →
								</div>
							</button>
						))}
					</div>

					<div className="mt-10 pt-8 border-t border-[var(--gb-border)] text-center">
						<p className="text-sm text-[var(--gb-text-muted)] italic">
							"Small, consistent efforts create massive results. Start Phase 1 today."
						</p>
					</div>
				</section>
			)}
		</div>
	);
}
