import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { Layout } from "./components/layout/Layout";

function ScrollToTop() {
	const { pathname } = useLocation();

	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is required to detect route changes
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

const DashboardPage = lazy(() =>
	import("./pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const WhiteboardPage = lazy(() =>
	import("./pages/whiteboard/WhiteboardPage").then((m) => ({ default: m.WhiteboardPage })),
);
const LearningPage = lazy(() =>
	import("./pages/learning/LearningPage").then((m) => ({ default: m.LearningPage })),
);
const QuizPage = lazy(() => import("./pages/quiz/QuizPage").then((m) => ({ default: m.QuizPage })));
const EarTrainingPage = lazy(() =>
	import("./pages/ear-training/EarTrainingPage").then((m) => ({ default: m.EarTrainingPage })),
);
const DailySessionPage = lazy(() =>
	import("./pages/daily-session/DailySessionPage").then((m) => ({ default: m.DailySessionPage })),
);

function PageLoader() {
	return (
		<div className="flex items-center justify-center min-h-[200px]">
			<div className="text-[var(--gb-text-muted)]">Loading...</div>
		</div>
	);
}

export function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Suspense fallback={<PageLoader />}>
				<Routes>
					<Route element={<Layout />}>
						<Route index element={<DashboardPage />} />
						<Route path="whiteboard/*" element={<WhiteboardPage />} />
						<Route path="learn/*" element={<LearningPage />} />
						<Route path="quiz/*" element={<QuizPage />} />
						<Route path="ear-training" element={<EarTrainingPage />} />
						<Route path="practice" element={<DailySessionPage />} />
					</Route>
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}
