import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { playFretPosition } from "@/lib/audio";
import { QuizRunner } from "./QuizRunner";

jest.mock("@/lib/audio", () => ({
	playFretPosition: jest.fn(() => Promise.resolve()),
}));

describe("QuizRunner", () => {
	it("autoplays and replays the guess-by-sound prompt", async () => {
		jest.spyOn(Math, "random").mockReturnValue(0);

		render(
			<QuizRunner
				type="note-guess-sound"
				difficulty="beginner"
				questionCount={1}
				timerEnabled={false}
				timerSeconds={15}
				onComplete={jest.fn()}
				onCancel={jest.fn()}
			/>,
		);

		await waitFor(() => {
			expect(playFretPosition).toHaveBeenCalled();
		});

		await userEvent.click(screen.getByRole("button", { name: /play note/i }));

		expect(playFretPosition).toHaveBeenCalledTimes(2);
		jest.spyOn(Math, "random").mockRestore();
	});

	it("accepts the correct answer for the sound quiz", async () => {
		jest.spyOn(Math, "random").mockReturnValue(0);

		render(
			<QuizRunner
				type="note-guess-sound"
				difficulty="beginner"
				questionCount={1}
				timerEnabled={false}
				timerSeconds={15}
				onComplete={jest.fn()}
				onCancel={jest.fn()}
			/>,
		);

		await userEvent.click(await screen.findByRole("button", { name: "F" }));
		await userEvent.click(screen.getByRole("button", { name: /check answer/i }));

		expect((await screen.findAllByText(/correct!/i)).length).toBeGreaterThan(0);
		jest.spyOn(Math, "random").mockRestore();
	});
});
