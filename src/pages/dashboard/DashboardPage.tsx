import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader } from "@/components/ui";
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
		<div>
			<h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{cards.map((card) => (
					<Card
						key={card.title}
						onClick={card.action}
						className={card.action ? "" : "cursor-default"}
					>
						<CardHeader>{card.title}</CardHeader>
						<CardContent>
							{card.accuracy !== null ? (
								<div className="text-3xl font-bold text-blue-600">{card.accuracy}%</div>
							) : (
								<div className="text-3xl font-bold text-blue-600">{dueCards.length}</div>
							)}
							<p className="text-sm text-gray-600 mt-1">{card.description}</p>
						</CardContent>
					</Card>
				))}
			</div>

			{sessionHistory.length === 0 && (
				<div className="mt-8 text-center">
					<p className="text-gray-600 mb-4">Welcome to Guitar Boy! Choose a mode to get started.</p>
					<div className="space-x-4">
						<button
							type="button"
							onClick={() => navigate("/learn")}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							Start Learning
						</button>
						<button
							type="button"
							onClick={() => navigate("/whiteboard")}
							className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
						>
							Explore Whiteboard
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
