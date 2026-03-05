# Quiz Creation Guide

This guide explains how to create and customize quiz types in the Fretboard Learning App.

## Quiz Types

The app currently supports 3 quiz types:

1. **Find the Note** - Click fretboard positions to identify notes
2. **Identify Interval** - Multiple choice interval recognition
3. **Build Chord** - Place chord tones on fretboard

## Quiz Architecture

### Components

- **QuizSelector**: Configure quiz parameters (type, difficulty, count)
- **QuizRunner**: Execute quiz logic and track progress
- **QuizFeedback**: Display results after each question
- **SessionSummary**: Show final statistics

### Data Flow

```
QuizSelector → QuizRunner → [Question Generation] → [User Interaction] → [Validation] → QuizFeedback → SessionSummary
```

## Creating a New Quiz Type

### Step 1: Define Quiz Type

Add to `QuizRunner.tsx`:

```typescript
// In generateQuestions function
if (category === "your-quiz-type") {
	// Generate questions
	const question = {
		id: `your-quiz-type-${i}`,
		type: "your-quiz-type",
		targetPositions: [...],
		// Add custom fields
	};
	generated.push(question);
}
```

### Step 2: Implement Question Generation

```typescript
// Example: Scale identification quiz
if (category === "scale") {
	const rootNote = getRandomNote();
	const scaleType = getRandomScale(); // "major", "minor", "pentatonic"
	const positions = getScalePositions(rootNote, scaleType);
	
	generated.push({
		id: `scale-${i}`,
		type: "scale",
		targetPositions: positions,
		targetScale: `${rootNote} ${scaleType}`,
	});
}
```

### Step 3: Update UI

In `QuizRunner.tsx`, add rendering logic:

```typescript
{currentQuestion.type === "scale" && (
	<>
		<p>Build the {currentQuestion.targetScale} scale</p>
		<Fretboard
			mode="test"
			onFretClick={handleFretClick}
			selectedPositions={selectedPositions}
			// ... props
		/>
	</>
)}
```

### Step 4: Implement Validation

```typescript
if (currentQuestion.type === "scale") {
	const requiredNotes = getScaleNotes(currentQuestion.targetScale);
	const placedNotes = selectedPositions.map(pos => getNoteAtFret(pos));
	
	// Check if all required notes are placed
	for (const note of requiredNotes) {
		if (!placedNotes.includes(note)) {
			missed.push(/* position */);
		}
	}
	
	// Check for incorrect notes
	for (const pos of selectedPositions) {
		if (!requiredNotes.includes(getNoteAtFret(pos))) {
			incorrect.push(pos);
		}
	}
}
```

### Step 5: Add to QuizSelector

Update `QuizSelector.tsx`:

```typescript
const quizTypes = [
	{ value: "note", label: "Find the Note", desc: "Click fretboard positions" },
	{ value: "interval", label: "Identify Interval", desc: "Name the interval" },
	{ value: "chord", label: "Build Chord", desc: "Place chord tones" },
	{ value: "scale", label: "Build Scale", desc: "Place scale notes" }, // NEW
];
```

## Customizing Difficulty

Difficulty affects question complexity:

```typescript
const difficultySettings = {
	beginner: {
		fretRange: [0, 5],
		questionTypes: ["basic"],
		hints: true,
	},
	intermediate: {
		fretRange: [0, 12],
		questionTypes: ["basic", "intermediate"],
		hints: false,
	},
	advanced: {
		fretRange: [0, 24],
		questionTypes: ["basic", "intermediate", "advanced"],
		hints: false,
	},
};
```

## Question Generation Patterns

### Random Position Generation

```typescript
function generateRandomPosition(fretRange: [number, number]): FretPosition {
	const string = Math.floor(Math.random() * 6);
	const fret = Math.floor(Math.random() * (fretRange[1] - fretRange[0] + 1)) + fretRange[0];
	return { string, fret };
}
```

### Multiple Choice Generation

```typescript
function generateMultipleChoice(
	correctAnswer: string,
	allOptions: string[],
	count: number = 4
): string[] {
	const wrong = allOptions.filter(opt => opt !== correctAnswer);
	const shuffled = wrong.sort(() => Math.random() - 0.5);
	const options = [correctAnswer, ...shuffled.slice(0, count - 1)];
	return options.sort(() => Math.random() - 0.5);
}
```

### Chord Tone Generation

```typescript
function generateChord(root: NoteName, quality: TriadQuality): FretPosition[] {
	const tones = getChordTones(root, quality);
	const positions: FretPosition[] = [];
	
	// Find positions for each chord tone
	for (const tone of tones) {
		const tonePositions = getAllPositionsOfNote(tone, [0, 12]);
		// Select one position per tone
		positions.push(tonePositions[0]);
	}
	
	return positions;
}
```

## Validation Strategies

### Exact Match

```typescript
// User must place exactly the right positions
function validateExactMatch(
	selected: FretPosition[],
	target: FretPosition[]
): boolean {
	return (
		selected.length === target.length &&
		selected.every(pos => 
			target.some(t => 
				t.string === pos.string && t.fret === pos.fret
			)
		)
	);
}
```

### Note Match

```typescript
// User must place the right notes (any octave)
function validateNoteMatch(
	selected: FretPosition[],
	targetNotes: NoteName[]
): { correct: boolean; missing: NoteName[]; extra: NoteName[] } {
	const selectedNotes = [...new Set(selected.map(pos => getNoteAtFret(pos)))];
	const targetSet = new Set(targetNotes);
	
	const missing = targetNotes.filter(note => !selectedNotes.includes(note));
	const extra = selectedNotes.filter(note => !targetSet.has(note));
	
	return {
		correct: missing.length === 0 && extra.length === 0,
		missing,
		extra,
	};
}
```

### Partial Credit

```typescript
// Give partial credit for partially correct answers
function calculateScore(
	correct: number,
	total: number,
	incorrect: number
): number {
	const base = correct / total;
	const penalty = incorrect * 0.1;
	return Math.max(0, base - penalty);
}
```

## Best Practices

### Question Quality

1. **Clear Instructions**: Make it obvious what the user should do
2. **Reasonable Difficulty**: Match difficulty level to expected skill
3. **Unambiguous Answers**: Ensure questions have clear correct answers
4. **Avoid Repetition**: Don't ask the same question multiple times

### Performance

1. **Pre-generate Questions**: Create all questions at quiz start
2. **Memoize Calculations**: Cache expensive computations
3. **Debounce Updates**: Batch state updates

### User Experience

1. **Instant Feedback**: Show results immediately
2. **Clear Visual Cues**: Use color coding consistently
3. **Progressive Difficulty**: Start easy, increase difficulty
4. **Forgiving**: Allow users to retry or skip

## Testing Your Quiz

### Manual Testing

1. **Play through**: Complete the quiz as a user would
2. **Edge cases**: Test boundary conditions
3. **Multiple difficulties**: Verify all difficulty levels work
4. **Cancel/Resume**: Test interruption scenarios

### Automated Testing

```typescript
describe("Your Quiz Type", () => {
	it("generates valid questions", () => {
		const questions = generateQuestions("your-type", "beginner", 10);
		expect(questions).toHaveLength(10);
		expect(questions[0]).toHaveProperty("type", "your-type");
	});
	
	it("validates correct answers", () => {
		const result = validateAnswer(correctAnswer, targetPositions);
		expect(result.correct).toBe(true);
	});
	
	it("rejects incorrect answers", () => {
		const result = validateAnswer(wrongAnswer, targetPositions);
		expect(result.correct).toBe(false);
	});
});
```

## Integration Checklist

- [ ] Question generation logic implemented
- [ ] UI rendering added to QuizRunner
- [ ] Validation logic implemented
- [ ] Added to QuizSelector options
- [ ] Manual testing completed
- [ ] Automated tests written
- [ ] Documentation updated
- [ ] Code reviewed

## Need Help?

- Review existing quiz implementations in `src/pages/quiz/QuizRunner.tsx`
- Check music theory helpers in `src/lib/music.ts`
- See type definitions in `src/types/`
- Review component contracts in `specs/001-fretboard-learning-app/contracts/`
