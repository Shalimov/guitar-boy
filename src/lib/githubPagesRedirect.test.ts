import { applyGitHubPagesRedirect, getGitHubPagesRedirectTarget } from "./githubPagesRedirect";

describe("getGitHubPagesRedirectTarget", () => {
	it("returns null when there is no github pages redirect payload", () => {
		expect(getGitHubPagesRedirectTarget("?mode=review", "/guitar-boy/")).toBeNull();
	});

	it("restores a nested route with query and hash", () => {
		expect(
			getGitHubPagesRedirectTarget(
				"?p=learn%2Fmajor-scale&q=step%3D2%26tab%3Dnotes&h=fret-12",
				"/guitar-boy/",
			),
		).toBe("/guitar-boy/learn/major-scale?step=2&tab=notes#fret-12");
	});

	it("restores the app root route", () => {
		expect(getGitHubPagesRedirectTarget("?p=", "/guitar-boy/")).toBe("/guitar-boy/");
	});
});

describe("applyGitHubPagesRedirect", () => {
	it("rewrites browser history when a redirect payload exists", () => {
		const history = {
			replaceState: jest.fn(),
		};

		expect(applyGitHubPagesRedirect("?p=quiz&q=mode%3Dtimed", history, "/guitar-boy/")).toBe(true);
		expect(history.replaceState).toHaveBeenCalledWith(null, "", "/guitar-boy/quiz?mode=timed");
	});

	it("does nothing when the payload is missing", () => {
		const history = {
			replaceState: jest.fn(),
		};

		expect(applyGitHubPagesRedirect("?mode=timed", history, "/guitar-boy/")).toBe(false);
		expect(history.replaceState).not.toHaveBeenCalled();
	});
});
