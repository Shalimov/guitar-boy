import { useState } from "react";
import type { CardCategory } from "@/types";

export type QuizType = CardCategory | "note-guess";

export interface QuizSettings {
	type: QuizType;
	difficulty: string;
	questionCount: number;
	timerEnabled: boolean;
	timerSeconds: number;
}

interface QuizSelectorProps {
	onStartQuiz: (settings: QuizSettings) => void;
}

const QUIZ_TYPES = [
	{
		value: "note",
		label: "Find the Note",
		desc: "Click all fretboard positions of a given note",
	},
	{
		value: "note-guess",
		label: "Guess the Note",
		desc: "Identify the note shown at a fretboard position",
	},
	{
		value: "interval",
		label: "Identify Interval",
		desc: "Name the interval between two positions",
	},
	{
		value: "chord",
		label: "Build Chord",
		desc: "Place chord tones on the fretboard",
	},
] as const;

export function QuizSelector({ onStartQuiz }: QuizSelectorProps) {
	const [type, setType] = useState<QuizType>("note");
	const [difficulty, setDifficulty] = useState<string>("beginner");
	const [questionCount, setQuestionCount] = useState<number>(10);
	const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
	const [timerSeconds, setTimerSeconds] = useState<number>(15);

	const handleStart = () => {
		onStartQuiz({ type, difficulty, questionCount, timerEnabled, timerSeconds });
	};

	return (
		<div className="gb-panel p-7 space-y-7">
			{/* Title */}
			<div>
				<p className="gb-page-kicker mb-1">Practice</p>
				<h1 className="gb-page-title">Quiz Mode</h1>
			</div>

			{/* Quiz type */}
			<fieldset className="space-y-2">
				<legend
					className="text-xs font-bold tracking-widest uppercase"
					style={{ color: "var(--gb-text-muted)" }}
				>
					Quiz Type
				</legend>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{QUIZ_TYPES.map((option) => {
						const active = type === option.value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => setType(option.value as QuizType)}
								style={
									active
										? {
												borderColor: "var(--gb-accent)",
												background:
													"color-mix(in srgb, var(--gb-accent-soft) 18%, var(--gb-bg-elev) 82%)",
											}
										: {
												borderColor: "var(--gb-border)",
												background: "var(--gb-bg-elev)",
											}
								}
								className="p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm focus-visible:outline-none"
							>
								<div
									className="font-semibold text-sm"
									style={{ color: active ? "var(--gb-accent-strong)" : "var(--gb-text)" }}
								>
									{option.label}
								</div>
								<div className="text-xs mt-0.5" style={{ color: "var(--gb-text-muted)" }}>
									{option.desc}
								</div>
							</button>
						);
					})}
				</div>
			</fieldset>

			{/* Difficulty */}
			<fieldset className="space-y-2">
				<legend
					className="text-xs font-bold tracking-widest uppercase"
					style={{ color: "var(--gb-text-muted)" }}
				>
					Difficulty
				</legend>
				<div className="flex gap-2 flex-wrap">
					{["beginner", "intermediate", "advanced"].map((level) => {
						const active = difficulty === level;
						return (
							<button
								key={level}
								type="button"
								onClick={() => setDifficulty(level)}
								style={
									active
										? {
												background: "var(--gb-accent)",
												color: "#fff8ee",
												borderColor: "var(--gb-accent)",
											}
										: {
												background: "var(--gb-bg-panel)",
												color: "var(--gb-text)",
												borderColor: "var(--gb-border)",
											}
								}
								className="px-5 py-2 rounded-full border font-medium text-sm transition-all hover:opacity-90 focus-visible:outline-none"
							>
								{level.charAt(0).toUpperCase() + level.slice(1)}
							</button>
						);
					})}
				</div>
			</fieldset>

			{/* Question count */}
			<fieldset className="space-y-2">
				<legend
					className="text-xs font-bold tracking-widest uppercase"
					style={{ color: "var(--gb-text-muted)" }}
				>
					Number of Questions
				</legend>
				<div className="flex gap-2 flex-wrap">
					{[5, 10, 20, 50].map((count) => {
						const active = questionCount === count;
						return (
							<button
								key={count}
								type="button"
								onClick={() => setQuestionCount(count)}
								style={
									active
										? {
												background: "var(--gb-accent)",
												color: "#fff8ee",
												borderColor: "var(--gb-accent)",
											}
										: {
												background: "var(--gb-bg-panel)",
												color: "var(--gb-text)",
												borderColor: "var(--gb-border)",
											}
								}
								className="w-14 py-2 rounded-full border font-medium text-sm text-center transition-all hover:opacity-90 focus-visible:outline-none"
							>
								{count}
							</button>
						);
					})}
				</div>
			</fieldset>

			{/* Timer */}
			<fieldset className="space-y-2">
				<legend
					className="text-xs font-bold tracking-widest uppercase"
					style={{ color: "var(--gb-text-muted)" }}
				>
					Timer
				</legend>
				<div className="flex items-center gap-3 flex-wrap">
					{/* Toggle */}
					<button
						type="button"
						role="switch"
						aria-checked={timerEnabled}
						onClick={() => setTimerEnabled((v) => !v)}
						style={{
							background: timerEnabled ? "var(--gb-accent)" : "var(--gb-bg-tab)",
						}}
						className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none"
					>
						<span
							className={`inline-block h-4 w-4 rounded-full shadow transition-transform ${
								timerEnabled ? "translate-x-6" : "translate-x-1"
							}`}
							style={{ background: "#fff8ee" }}
						/>
					</button>

					<span className="text-sm font-medium" style={{ color: "var(--gb-text)" }}>
						{timerEnabled ? "Timer on" : "No timer"}
					</span>

					{timerEnabled && (
						<>
							<span className="text-sm ml-2" style={{ color: "var(--gb-text-muted)" }}>
								Seconds per question:
							</span>
							<div className="flex gap-2 flex-wrap">
								{[10, 15, 20, 30, 60].map((secs) => {
									const active = timerSeconds === secs;
									return (
										<button
											key={secs}
											type="button"
											onClick={() => setTimerSeconds(secs)}
											style={
												active
													? {
															background: "var(--gb-accent)",
															color: "#fff8ee",
															borderColor: "var(--gb-accent)",
														}
													: {
															background: "var(--gb-bg-panel)",
															color: "var(--gb-text)",
															borderColor: "var(--gb-border)",
														}
											}
											className="px-3 py-1 rounded-full border text-sm font-medium transition-all hover:opacity-90 focus-visible:outline-none"
										>
											{secs}s
										</button>
									);
								})}
							</div>
						</>
					)}
				</div>
			</fieldset>

			{/* Start button */}
			<button
				type="button"
				onClick={handleStart}
				style={{
					background: "var(--gb-accent)",
					color: "#fff8ee",
					boxShadow: "0 4px 14px rgba(179,93,42,0.35)",
				}}
				className="w-full py-3 rounded-xl font-semibold text-base tracking-wide transition-all hover:opacity-90 active:scale-[0.98] focus-visible:outline-none"
			>
				Start Quiz
			</button>
		</div>
	);
}
