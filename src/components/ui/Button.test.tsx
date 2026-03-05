import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
	it("renders children", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
	});

	it("calls onClick when clicked", async () => {
		const onClick = jest.fn();
		render(<Button onClick={onClick}>Click me</Button>);

		await userEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("does not call onClick when disabled", async () => {
		const onClick = jest.fn();
		render(
			<Button onClick={onClick} disabled>
				Click me
			</Button>,
		);

		await userEvent.click(screen.getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("applies variant styles", () => {
		const { rerender } = render(<Button variant="primary">Primary</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-blue-600");

		rerender(<Button variant="secondary">Secondary</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-gray-200");

		rerender(<Button variant="ghost">Ghost</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-transparent");
	});

	it("applies size styles", () => {
		const { rerender } = render(<Button size="sm">Small</Button>);
		expect(screen.getByRole("button")).toHaveClass("px-3", "py-1.5");

		rerender(<Button size="md">Medium</Button>);
		expect(screen.getByRole("button")).toHaveClass("px-4", "py-2");

		rerender(<Button size="lg">Large</Button>);
		expect(screen.getByRole("button")).toHaveClass("px-6", "py-3");
	});

	it("applies disabled styles", () => {
		render(<Button disabled>Disabled</Button>);
		expect(screen.getByRole("button")).toHaveClass("opacity-50", "cursor-not-allowed");
	});

	it("supports custom className", () => {
		render(<Button className="custom-class">Custom</Button>);
		expect(screen.getByRole("button")).toHaveClass("custom-class");
	});
});
