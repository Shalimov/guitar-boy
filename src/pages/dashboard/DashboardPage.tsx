import { useNavigate } from "react-router";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { useProgressStore } from "@/hooks/useProgressStore";
import { getDueCards } from "@/lib/srs";

export function DashboardPage() {
	const navigate = useNavigate();
	const { store } = useProgressStore();

	const dueCards = getDueCards(store.cards);
	const sessionHistory = store.sessionHistory;
	const sessionsToday = sessionHistory.filter(
		(session) => new Date(session.date).toDateString() === new Date().toDateString(),
	).length;
	const recentSessions = sessionHistory.slice(0, 3);

	const notesSessions = sessionHistory.filter((s) => s.mode === "quiz-note");
	const intervalSessions = sessionHistory.filter((s) => s.mode === "quiz-interval");
	const chordSessions = sessionHistory.filter((s) => s.mode === "quiz-chord");

	const calculateAccuracy = (sessions: typeof sessionHistory) => {
		if (sessions.length === 0) return 0;
		const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);
		const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
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
	const primaryAction =
		dueCards.length > 0
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
		sessionHistory.length === 0
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
				return "Review session";
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
						{recentSessions.map((session) => (
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

			{sessionHistory.length === 0 && (
				<section className="gb-panel px-6 py-8 text-center">
					<h2 className="text-2xl font-semibold text-[var(--gb-text)]">New Here? Start A Warmup</h2>
					<p className="mx-auto mt-2 max-w-xl text-sm text-[var(--gb-text-muted)]">
						Pick a guided lesson to build confidence, or sketch on the whiteboard to explore note
						shapes freely.
					</p>
					<div className="mt-5 flex flex-wrap justify-center gap-3">
						<Button onClick={() => navigate("/learn")}>Start Learning</Button>
						<Button variant="secondary" onClick={() => navigate("/whiteboard")}>
							Explore Whiteboard
						</Button>
					</div>
				</section>
			)}
		</div>
	);
}
