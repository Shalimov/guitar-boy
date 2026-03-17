function normalizeBasePath(basePath: string) {
	if (!basePath || basePath === "/") {
		return "";
	}

	return `/${basePath.replace(/^\/+|\/+$/g, "")}`;
}

export function getGitHubPagesRedirectTarget(search: string, basePath: string) {
	const params = new URLSearchParams(search);
	const routePath = params.get("p");

	if (routePath === null) {
		return null;
	}

	params.delete("p");

	const query = params.get("q");
	if (query !== null) {
		params.delete("q");
	}

	const hash = params.get("h");
	if (hash !== null) {
		params.delete("h");
	}

	const normalizedBasePath = normalizeBasePath(basePath);
	const cleanedRoutePath = routePath.replace(/^\/+/, "");
	const baseTarget = normalizedBasePath ? `${normalizedBasePath}/` : "/";
	let target = cleanedRoutePath ? `${baseTarget}${cleanedRoutePath}` : baseTarget;

	const queryParts = [query, params.toString()].filter(Boolean);
	if (queryParts.length > 0) {
		target += `?${queryParts.join("&")}`;
	}

	if (hash) {
		target += `#${hash}`;
	}

	return target;
}

export function applyGitHubPagesRedirect(
	search: string,
	history: Pick<History, "replaceState">,
	basePath: string,
) {
	const redirectTarget = getGitHubPagesRedirectTarget(search, basePath);

	if (!redirectTarget) {
		return false;
	}

	history.replaceState(null, "", redirectTarget);
	return true;
}
