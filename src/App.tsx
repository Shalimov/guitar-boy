import { BrowserRouter, Route, Routes } from "react-router";
import { Layout } from "./components/layout/Layout";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { LearningPage } from "./pages/learning/LearningPage";
import { QuizPage } from "./pages/quiz/QuizPage";
import { WhiteboardPage } from "./pages/whiteboard/WhiteboardPage";

export function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route index element={<DashboardPage />} />
					<Route path="whiteboard" element={<WhiteboardPage />} />
					<Route path="learn" element={<LearningPage />} />
					<Route path="quiz" element={<QuizPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
