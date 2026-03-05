import { useState } from "react";
import type { CardCategory } from "@/types";

interface QuizSelectorProps {
	onStartQuiz: (category: CardCategory, difficulty: string, questionCount: number) => void;
}

export function QuizSelector({ onStartQuiz }: QuizSelectorProps) {
	const [category, setCategory] = useState<CardCategory>("note");
	const [difficulty, setDifficulty] = useState<string>("beginner");
	const [questionCount, setQuestionCount] = useState<number>(10);

	const handleStart = () => {
		onStartQuiz(category, difficulty, questionCount);
	};

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-3xl font-bold text-gray-900 mb-6">Quiz Mode</h1>

			<div className="space-y-6">
				<fieldset>
					<legend className="block text-sm font-medium text-gray-700 mb-2">Quiz Type</legend>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{[
							{ value: "note", label: "Find the Note", desc: "Click fretboard positions" },
							{ value: "interval", label: "Identify Interval", desc: "Name the interval" },
							{ value: "chord", label: "Build Chord", desc: "Place chord tones" },
						].map((option) => (
							<button
								key={option.value}
								type="button"
								onClick={() => setCategory(option.value as CardCategory)}
								className={`p-4 rounded-lg border-2 text-left transition-colors ${
									category === option.value
										? "border-blue-500 bg-blue-50"
										: "border-gray-200 hover:border-gray-300"
								}`}
							>
								<div className="font-medium text-gray-900">{option.label}</div>
								<div className="text-sm text-gray-500">{option.desc}</div>
							</button>
						))}
					</div>
				</fieldset>

				<fieldset>
					<legend className="block text-sm font-medium text-gray-700 mb-2">Difficulty</legend>
					<div className="flex gap-3">
						{["beginner", "intermediate", "advanced"].map((level) => (
							<button
								key={level}
								type="button"
								onClick={() => setDifficulty(level)}
								className={`px-6 py-2 rounded-lg font-medium transition-colors ${
									difficulty === level
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{level.charAt(0).toUpperCase() + level.slice(1)}
							</button>
						))}
					</div>
				</fieldset>

				<fieldset>
					<legend className="block text-sm font-medium text-gray-700 mb-2">
						Number of Questions
					</legend>
					<div className="flex gap-3">
						{[5, 10, 20, 50].map((count) => (
							<button
								key={count}
								type="button"
								onClick={() => setQuestionCount(count)}
								className={`px-6 py-2 rounded-lg font-medium transition-colors ${
									questionCount === count
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{count}
							</button>
						))}
					</div>
				</fieldset>

				<button
					type="button"
					onClick={handleStart}
					className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
				>
					Start Quiz
				</button>
			</div>
		</div>
	);
}
