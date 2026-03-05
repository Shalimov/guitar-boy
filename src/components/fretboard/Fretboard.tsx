import { useState } from "react";
import { getNoteAtFret } from "@/lib/music";
import type { FretboardProps, FretboardState, FretPosition } from "@/types";

export function Fretboard({
	fretRange = [0, 12],
	strings = ["E", "A", "D", "G", "B", "e"],
	showFretNumbers = true,
	state,
	mode,
	onFretClick,
	selectedPositions = [],
	correctPositions = [],
	missedPositions = [],
	incorrectPositions = [],
}: FretboardProps) {
	const [internalState, setInternalState] = useState<FretboardState>({
		dots: state?.dots || [],
		lines: state?.lines || [],
	});

	const [minFret, maxFret] = fretRange;
	const fretCount = maxFret - minFret + 1;

	const handleFretClick = (pos: FretPosition) => {
		if (mode === "click-select" && onFretClick) {
			onFretClick(pos);
		} else if (mode === "draw") {
			const existingDotIndex = internalState.dots.findIndex(
				(d) => d.position.string === pos.string && d.position.fret === pos.fret,
			);

			if (existingDotIndex >= 0) {
				setInternalState({
					...internalState,
					dots: internalState.dots.filter((_, i) => i !== existingDotIndex),
				});
			} else {
				setInternalState({
					...internalState,
					dots: [...internalState.dots, { position: pos }],
				});
			}

			if (onFretClick) {
				onFretClick(pos);
			}
		}
	};

	const isPositionSelected = (pos: FretPosition): boolean => {
		return selectedPositions.some((p) => p.string === pos.string && p.fret === pos.fret);
	};

	const isPositionCorrect = (pos: FretPosition): boolean => {
		return correctPositions.some((p) => p.string === pos.string && p.fret === pos.fret);
	};

	const isPositionMissed = (pos: FretPosition): boolean => {
		return missedPositions.some((p) => p.string === pos.string && p.fret === pos.fret);
	};

	const isPositionIncorrect = (pos: FretPosition): boolean => {
		return incorrectPositions.some((p) => p.string === pos.string && p.fret === pos.fret);
	};

	const getDotLabel = (pos: FretPosition): string | undefined => {
		const dot = internalState.dots.find(
			(d) => d.position.string === pos.string && d.position.fret === pos.fret,
		);
		return dot?.label;
	};

	const fretNumbers = Array.from({ length: fretCount }, (_, i) => i + minFret);
	const stringRows = strings.map((note, index) => ({ note, index }));

	return (
		<div className="inline-block">
			{showFretNumbers && (
				<div className="flex mb-2 ml-12">
					{fretNumbers.map((fret) => (
						<div key={`fretnum-${fret}`} className="w-8 text-center text-xs text-gray-600">
							{fret}
						</div>
					))}
				</div>
			)}

			<div className="flex flex-col gap-1">
				{stringRows.map(({ note, index: stringIndex }) => (
					<div key={`string-${stringIndex}`} className="flex items-center gap-1">
						<div className="w-10 text-right text-xs text-gray-600 pr-2">{note}</div>
						<div className="flex gap-1">
							{fretNumbers.map((fret) => {
								const pos: FretPosition = { string: stringIndex, fret };
								const isSelected = isPositionSelected(pos);
								const isCorrect = isPositionCorrect(pos);
								const isMissed = isPositionMissed(pos);
								const isIncorrect = isPositionIncorrect(pos);
								const dotLabel = getDotLabel(pos);

								const cellBase =
									"w-8 h-8 border border-gray-300 flex items-center justify-center text-xs font-medium";
								const cellColor = isSelected
									? "bg-blue-200 border-blue-400"
									: isCorrect
										? "bg-green-200 border-green-400"
										: isMissed
											? "bg-yellow-200 border-yellow-400"
											: isIncorrect
												? "bg-red-200 border-red-400"
												: "bg-white";

								if (mode === "view") {
									return (
										<div key={`cell-${stringIndex}-${fret}`} className={`${cellBase} ${cellColor}`}>
											{dotLabel && <span className="z-10">{dotLabel}</span>}
										</div>
									);
								}

								return (
									<button
										key={`btn-${stringIndex}-${fret}`}
										type="button"
										onClick={() => handleFretClick(pos)}
										className={`${cellBase} ${cellColor} cursor-pointer hover:bg-gray-100`}
										aria-label={`String ${stringIndex}, Fret ${fret}, Note ${getNoteAtFret(pos)}`}
									>
										{dotLabel && <span className="z-10">{dotLabel}</span>}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
