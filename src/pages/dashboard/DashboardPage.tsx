import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { useProgressStore } from "@/hooks/useProgressStore";
import { EMPTY_MISTAKE_LOG } from "@/lib/mistakeAnalysis";
import { scheduleReminder } from "@/lib/reminders";
import { getDueCards } from "@/lib/srs";
import { computeStreak, getActiveDays } from "@/lib/streak";
import type { SessionRecord } from "@/types";
import { OverdueBanner } from "./OverdueBanner";
import { ReminderSettings } from "./ReminderSettings";
import { StreakDisplay } from "./StreakDisplay";
import { WeakSpotsPanel } from "./WeakSpotsPanel";

export function DashboardPage() {
	const navigate = useNavigate();
	const { store } = useProgressStore();
	const [bannerDismissed, setBannerDismissed] = useState(false);

	const dueCards = getDueCards(store.cards);
	const sessionHistory: SessionRecord[] = store.sessionHistory;

	const activeDays = getActiveDays(sessionHistory);
	const { currentStreak, longestStreak } = computeStreak(
		sessionHistory.map((s: SessionRecord) => s.date),
	);

	useEffect(() => {
		const { reminder } = store.settings;
		if (!reminder?.enabled) return;
		const cleanup = scheduleReminder(reminder.time, dueCards.length);
		return cleanup;
	}, [store.settings, dueCards.length]);

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

	const cards = [
		{
			title: "Notes",
			accuracy: calculateAccuracy(notesSessions),
			description: "Note recognition progress",
			action: () => navigate("/quiz"),
		},
		{
			title: "Intervals",
			accuracy: calculateAccuracy(intervalSessions),
			description: "Interval training progress",
			action: () => navigate("/quiz"),
		},
		{
			title: "Chords",
			accuracy: calculateAccuracy(chordSessions),
			description: "Chord building progress",
			action: () => navigate("/quiz"),
		},
		{
			title: "Due for Review",
			accuracy: null,
			description: `${dueCards.length} cards due today`,
			action: dueCards.length > 0 ? () => navigate("/quiz") : undefined,
		},
	];

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
		: dueCards.length > 0
			? {
					label: "Review due cards",
					description: `${dueCards.length} card${dueCards.length === 1 ? "" : "s"} ready for spaced repetition.`,
					action: () => navigate("/quiz"),
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
		hasDoneToday && dueCards.length === 0
			? { label: "Open ear training", action: () => navigate("/ear-training") }
			: sessionHistory.length === 0
				? { label: "Explore whiteboard", action: () => navigate("/whiteboard") }
				: { label: "Open ear training", action: () => navigate("/ear-training") };

	const formatModeLabel = (mode: (typeof sessionHistory)[number]["mode"]) => {
		switch (mode) {
			case "quiz-note":
				return "Note quiz";
			case "quiz-interval":
				return "Interval quiz";
			case "quiz-chord":
				return "Chord quiz";
			case "review":
				return "SRS review";
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
			<header className="space-y-2">
				<p className="gb-page-kicker">Practice Radar</p>
				<h1 className="gb-page-title">Dashboard</h1>
				<p className="max-w-2xl text-sm text-[var(--gb-text-muted)]">
					Track momentum across notes, intervals, and chords, then jump straight into your next
					focused session.
				</p>
			</header>

			{dueCards.length > 0 && !bannerDismissed && (
				<OverdueBanner
					dueCount={dueCards.length}
					onStartReview={() => navigate("/quiz/review")}
					onDismiss={() => setBannerDismissed(true)}
				/>
			)}

			{sessionHistory.length > 0 && (
				<StreakDisplay
					currentStreak={currentStreak}
					longestStreak={longestStreak}
					activeDays={activeDays}
				/>
			)}

			<section className="gb-panel overflow-hidden">
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

					<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
						{[
							{ label: "Due now", value: dueCards.length, detail: "cards ready" },
							{ label: "Sessions today", value: sessionsToday, detail: "practice blocks" },
							{ label: "Tracked sessions", value: sessionHistory.length, detail: "recent history" },
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

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{cards.map((card) => (
					<Card
						key={card.title}
						onClick={card.action}
						className={card.action ? "group relative overflow-hidden" : "opacity-90"}
					>
						<div
							aria-hidden
							className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[radial-gradient(circle,_rgba(232,180,141,0.42),_transparent_70%)]"
						/>
						<CardHeader className="relative text-base tracking-[0.01em]">{card.title}</CardHeader>
						<CardContent>
							{card.accuracy !== null ? (
								<div className="text-4xl font-extrabold text-[var(--gb-accent)]">
									{card.accuracy}%
								</div>
							) : (
								<div className="text-4xl font-extrabold text-[var(--gb-accent)]">
									{dueCards.length}
								</div>
							)}
							<p className="mt-1 text-sm text-[var(--gb-text-muted)]">{card.description}</p>
						</CardContent>
					</Card>
				))}
			</div>

			{recentSessions.length > 0 && (
				<section className="gb-panel p-6">
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

			<WeakSpotsPanel mistakeLog={store.mistakeLog ?? EMPTY_MISTAKE_LOG} />

			{sessionHistory.length === 0 && (
				<section className="gb-panel px-6 py-10 md:px-10">
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
								action: () => navigate("/ear-training"),
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

			<ReminderSettings />
		</div>
	);
}
