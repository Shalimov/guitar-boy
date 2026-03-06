import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizSelector } from "./QuizSelector";

describe("QuizSelector", () => {
	it("offers and starts the sound-guess quiz", async () => {
		const onStartQuiz = jest.fn();

		render(<QuizSelector onStartQuiz={onStartQuiz} />);

		await userEvent.click(screen.getByRole("button", { name: /guess by sound/i }));
		await userEvent.click(screen.getByRole("button", { name: /start quiz/i }));

		expect(onStartQuiz).toHaveBeenCalledWith(expect.objectContaining({ type: "note-guess-sound" }));
	});
});
