import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import { useProgressStore } from "@/hooks/useProgressStore";
import { computeAdaptiveConfig } from "@/lib/adaptiveDifficulty";
import type { CardCategory } from "@/types";

export type QuizType = CardCategory | "note-guess" | "note-guess-sound";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface QuizSettings {
	type: QuizType;
	difficulty: Difficulty;
	questionCount: number;
	timerEnabled: boolean;
	timerSeconds: number;
	deepPractice: boolean;
	mode: "regular" | "speed";
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
		value: "note-guess-sound",
		label: "Guess by Sound",
		desc: "Hear a note, then identify it without a visual marker",
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
	const { store } = useProgressStore();
	const [type, setType] = useState<QuizType>("note");
	const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
	const [questionCount, setQuestionCount] = useState<number>(10);
	const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
	const [timerSeconds, setTimerSeconds] = useState<number>(15);
	const [deepPractice, setDeepPractice] = useState<boolean>(false);
	const [mode, setMode] = useState<"regular" | "speed">("regular");

	// Compute adaptive suggestion
	const modeMapping: Record<QuizType, "quiz-note" | "quiz-interval" | "quiz-chord"> = {
		note: "quiz-note",
		"note-guess": "quiz-note",
		"note-guess-sound": "quiz-note",
		interval: "quiz-interval",
		chord: "quiz-chord",
	};

	const modeKey = modeMapping[type];
	const currentFretMax = store.adaptiveState?.[modeKey]?.effectiveFretMax ?? 5;
	const adaptive = computeAdaptiveConfig(store.sessionHistory, modeKey, currentFretMax);

	useEffect(() => {
		// Pre-select suggested difficulty when type changes
		setDifficulty(adaptive.suggestedDifficulty);
	}, [adaptive.suggestedDifficulty]);

	const handleStart = () => {
		onStartQuiz({
			type,
			difficulty,
			questionCount,
			timerEnabled,
			timerSeconds,
			deepPractice,
			mode,
		});
	};

	const selectedType = QUIZ_TYPES.find((option) => option.value === type) ?? QUIZ_TYPES[0];
	const timerSummary = timerEnabled ? `${timerSeconds}s per question` : "No timer";

	return (
		<div className="gb-panel p-7 space-y-7">
			<PageHeader
				kicker="Practice"
				title="Quiz Mode"
				description="Pick a drill, then fine-tune the pace. The current setup is summarized before you start."
			/>

			<div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
				<div className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)]/70 p-5 space-y-4">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
							Step 1
						</p>
						<h3 className="mt-2 text-lg font-semibold text-[var(--gb-text)]">Choose your drill</h3>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							Start with the skill you want to sharpen right now.
						</p>
					</div>

					<div className="pt-4 border-t border-[var(--gb-border)]/50">
						<p className="text-[10px] font-bold uppercase tracking-widest text-[var(--gb-text-muted)] mb-3">
							Quiz Flow
						</p>
						<div className="flex bg-[var(--gb-bg-tab)] p-1 rounded-xl w-fit">
							<button
								type="button"
								onClick={() => setMode("regular")}
								className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
									mode === "regular"
										? "bg-[var(--gb-bg-panel)] text-[var(--gb-accent-strong)] shadow-sm"
										: "text-[var(--gb-text-muted)] hover:text-[var(--gb-text)]"
								}`}
							>
								Regular
							</button>
							<button
								type="button"
								onClick={() => setMode("speed")}
								className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
									mode === "speed"
										? "bg-[var(--gb-bg-panel)] text-[var(--gb-accent-strong)] shadow-sm"
										: "text-[var(--gb-text-muted)] hover:text-[var(--gb-text)]"
								}`}
							>
								⚡ Speed Drill
							</button>
						</div>
					</div>
				</div>

				<div className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 shadow-[var(--gb-shadow-soft)]">
					<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
						Current setup
					</p>
					<h3 className="mt-2 text-lg font-semibold text-[var(--gb-text)]">{selectedType.label}</h3>
					<p className="mt-1 text-sm text-[var(--gb-text-muted)]">{selectedType.desc}</p>
					<div className="mt-4 grid grid-cols-3 gap-2 text-sm">
						<div className="flex flex-col items-center justify-center rounded-xl bg-[var(--gb-bg-panel)] px-3 py-3 text-center h-full">
							<div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gb-text-muted)]">
								Level
							</div>
							<div className="mt-1 font-semibold leading-tight text-[var(--gb-text)]">
								{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
							</div>
						</div>
						<div className="flex flex-col items-center justify-center rounded-xl bg-[var(--gb-bg-panel)] px-3 py-3 text-center h-full">
							<div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gb-text-muted)]">
								Questions
							</div>
							<div className="mt-1 font-semibold leading-tight text-[var(--gb-text)]">
								{questionCount}
							</div>
						</div>
						<div className="flex flex-col items-center justify-center rounded-xl bg-[var(--gb-bg-panel)] px-3 py-3 text-center h-full">
							<div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gb-text-muted)]">
								Pace
							</div>
							<div className="mt-1 font-semibold leading-tight text-[var(--gb-text)]">
								{timerSummary}
							</div>
						</div>
					</div>
				</div>
			</div>

			<fieldset className="space-y-2">
				<legend
					className="text-xs font-bold tracking-widest uppercase"
					style={{ color: "var(--gb-text-muted)" }}
				>
					Quiz Type
				</legend>
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
								className="rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm focus-visible:outline-none"
							>
								<div
									className="font-semibold text-sm"
									style={{ color: active ? "var(--gb-accent-strong)" : "var(--gb-text)" }}
								>
									{option.label}
								</div>
								<div className="mt-0.5 text-xs" style={{ color: "var(--gb-text-muted)" }}>
									{option.desc}
								</div>
							</button>
						);
					})}
				</div>
			</fieldset>

			<div className="grid gap-4 lg:grid-cols-2">
				<fieldset className="space-y-4 rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5">
					<div>
						<p className="text-xs font-bold tracking-widest uppercase text-[var(--gb-text-muted)]">
							Step 2
						</p>
						<legend className="mt-2 text-lg font-semibold text-[var(--gb-text)]">
							Set difficulty
						</legend>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							Beginner keeps the neck tighter, advanced opens the full range.
						</p>
					</div>
					<div className="flex gap-2 flex-wrap items-center">
						{(["beginner", "intermediate", "advanced"] as const).map((level) => {
							const active = difficulty === level;
							const isSuggested = adaptive.suggestedDifficulty === level;
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
									className="relative rounded-full border px-5 py-2 text-sm font-medium transition-all hover:opacity-90 focus-visible:outline-none"
								>
									{level.charAt(0).toUpperCase() + level.slice(1)}
									{isSuggested && (
										<span className="absolute -top-1 -right-1 flex h-3 w-3">
											<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--gb-accent)] opacity-75" />
											<span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--gb-accent)]" />
										</span>
									)}
								</button>
							);
						})}
						<p className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[var(--gb-accent-strong)]">
							Suggested based on {Math.round(adaptive.rollingAccuracy * 100)}% accuracy
						</p>
					</div>
				</fieldset>

				<fieldset className="space-y-4 rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5">
					<div>
						<p className="text-xs font-bold tracking-widest uppercase text-[var(--gb-text-muted)]">
							Step 3
						</p>
						<legend className="mt-2 text-lg font-semibold text-[var(--gb-text)]">
							Set the pace
						</legend>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							Choose how long the session feels and whether you want timed pressure.
						</p>
					</div>

					<div>
						<p className="mb-2 text-xs font-bold tracking-widest uppercase text-[var(--gb-text-muted)]">
							Number of Questions
						</p>
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
										className="w-14 rounded-full border py-2 text-center text-sm font-medium transition-all hover:opacity-90 focus-visible:outline-none"
									>
										{count}
									</button>
								);
							})}
						</div>
					</div>

					<div className="space-y-2">
						<p className="text-xs font-bold tracking-widest uppercase text-[var(--gb-text-muted)]">
							Timer
						</p>
						<div className="flex items-center gap-3 flex-wrap">
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
													className="rounded-full border px-3 py-1 text-sm font-medium transition-all hover:opacity-90 focus-visible:outline-none"
												>
													{secs}s
												</button>
											);
										})}
									</div>
								</>
							)}
						</div>
					</div>

					<div className="space-y-2 pt-2 border-t border-[var(--gb-border)]">
						<p className="text-xs font-bold tracking-widest uppercase text-[var(--gb-text-muted)]">
							Deep Practice
						</p>
						<div className="flex items-center gap-3">
							<button
								type="button"
								role="switch"
								aria-checked={deepPractice}
								onClick={() => setDeepPractice((v) => !v)}
								style={{
									background: deepPractice ? "var(--gb-accent)" : "var(--gb-bg-tab)",
								}}
								className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none"
							>
								<span
									className={`inline-block h-4 w-4 rounded-full shadow transition-transform ${
										deepPractice ? "translate-x-6" : "translate-x-1"
									}`}
									style={{ background: "#fff8ee" }}
								/>
							</button>
							<span className="text-sm text-[var(--gb-text-muted)]">
								Chain follow-up questions to reinforce memory
							</span>
						</div>
					</div>
				</fieldset>
			</div>

			<button
				type="button"
				onClick={handleStart}
				style={{
					background: "var(--gb-accent)",
					color: "#fff8ee",
					boxShadow: "0 4px 14px rgba(179,93,42,0.35)",
				}}
				className="w-full rounded-xl py-3 text-base font-semibold tracking-wide transition-all hover:opacity-90 active:scale-[0.98] focus-visible:outline-none"
			>
				Start Quiz
			</button>
		</div>
	);
}
