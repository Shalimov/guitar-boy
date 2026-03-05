import { useNavigate } from "react-router";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { useProgressStore } from "@/hooks/useProgressStore";
import { getDueCards } from "@/lib/srs";

export function DashboardPage() {
	const navigate = useNavigate();
	const { store } = useProgressStore();

	const dueCards = getDueCards(store.cards);
	const sessionHistory = store.sessionHistory;

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
