import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizSelector } from "./QuizSelector";

describe("QuizSelector", () => {
	it("starts quiz from quick preset", async () => {
		const onStartQuiz = jest.fn();

		render(<QuizSelector onStartQuiz={onStartQuiz} />);

		await userEvent.click(screen.getByRole("button", { name: /quick notes/i }));

		expect(onStartQuiz).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "note",
				questionCount: 10,
			}),
		);
	});

	it("opens custom setup wizard", async () => {
		const onStartQuiz = jest.fn();

		render(<QuizSelector onStartQuiz={onStartQuiz} />);

		await userEvent.click(screen.getByRole("button", { name: /custom setup/i }));

		expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
	});
});
