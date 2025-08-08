/**
 * Utility for building Researcherry documentation links to local documentation.
 *
 * @param path - The path after the docs root (no leading slash)
 * @param campaign - The campaign context (e.g. "welcome", "provider_docs", "tips", "error_tooltip")
 * @returns The local docs path
 */
export function buildDocLink(path: string, _campaign: string): string {
	// Remove any leading slash from path
	const cleanPath = path.replace(/^\//, "")
	const [basePath, hash] = cleanPath.split("#")

	// Convert external docs paths to local .docs paths
	let localPath = basePath
	if (basePath.startsWith("getting-started/")) {
		localPath = `.docs/${basePath}`
	} else if (basePath.startsWith("basic-usage/")) {
		localPath = `.docs/${basePath}`
	} else if (basePath.startsWith("advanced-usage/")) {
		localPath = `.docs/${basePath}`
	} else if (basePath === "faq") {
		localPath = `.docs/faq`
	} else {
		// Default to .docs folder
		localPath = `.docs/${basePath}`
	}

	// Add .md extension if not present
	if (!localPath.endsWith(".md")) {
		localPath += ".md"
	}

	return hash ? `${localPath}#${hash}` : localPath
}
