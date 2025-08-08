import * as path from "path"
import * as os from "os"
import * as fs from "fs/promises"

/**
 * Gets the global .researcherry directory path
 *
 * @returns The absolute path to the global .researcherry directory
 *
 * @example
 * ```typescript
 * const globalDir = getGlobalResearcherryDirectory()
 * // Returns: "/Users/john/.researcherry" (on macOS/Linux)
 * // Returns: "C:\\Users\\john\\.researcherry" (on Windows)
 * ```
 */
export function getGlobalResearcherryDirectory(): string {
	const homeDir = os.homedir()
	return path.join(homeDir, ".researcherry")
}

/**
 * Gets the project-local .researcherry directory path for a given cwd
 *
 * @param cwd - Current working directory (project path)
 * @returns The absolute path to the project-local .researcherry directory
 *
 * @example
 * ```typescript
 * const projectDir = getProjectResearcherryDirectoryForCwd('/Users/john/my-project')
 * // Returns: "/Users/john/my-project/.researcherry"
 *
 * const windowsProjectDir = getProjectResearcherryDirectoryForCwd('C:\\Users\\john\\my-project')
 * // Returns: "C:\\Users\\john\\my-project\\.researcherry"
 * ```
 *
 * @example Directory structure:
 * ```
 * /Users/john/my-project/
 * ├── .researcherry/                    # Project-local configuration directory
 * │   ├── rules/
 * │   │   └── rules.md
 * │   ├── custom-instructions.md
 * │   └── config/
 * │       └── settings.json
 * ├── src/
 * │   └── index.ts
 * └── package.json
 * ```
 */
export function getProjectResearcherryDirectoryForCwd(cwd: string): string {
	return path.join(cwd, ".researcherry")
}

/**
 * Checks if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
	try {
		const stat = await fs.stat(dirPath)
		return stat.isDirectory()
	} catch (error: any) {
		// Only catch expected "not found" errors
		if (error.code === "ENOENT" || error.code === "ENOTDIR") {
			return false
		}
		// Re-throw unexpected errors (permission, I/O, etc.)
		throw error
	}
}

/**
 * Checks if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
	try {
		const stat = await fs.stat(filePath)
		return stat.isFile()
	} catch (error: any) {
		// Only catch expected "not found" errors
		if (error.code === "ENOENT" || error.code === "ENOTDIR") {
			return false
		}
		// Re-throw unexpected errors (permission, I/O, etc.)
		throw error
	}
}

/**
 * Reads a file safely, returning null if it doesn't exist
 */
export async function readFileIfExists(filePath: string): Promise<string | null> {
	try {
		return await fs.readFile(filePath, "utf-8")
	} catch (error: any) {
		// Only catch expected "not found" errors
		if (error.code === "ENOENT" || error.code === "ENOTDIR" || error.code === "EISDIR") {
			return null
		}
		// Re-throw unexpected errors (permission, I/O, etc.)
		throw error
	}
}

/**
 * Gets the ordered list of .researcherry directories to check (global first, then project-local)
 *
 * @param cwd - Current working directory (project path)
 * @returns Array of directory paths to check in order [global, project-local]
 *
 * @example
 * ```typescript
 * const directories = getResearcherryDirectoriesForCwd('/Users/john/my-project')
 * // Returns: ["/Users/john/.researcherry", "/Users/john/my-project/.researcherry"]
 * ```
 *
 * @example Directory structure:
 * ```
 * ~/.researcherry/                      # Global configuration directory
 * ├── rules/
 * │   └── rules.md              # Global rules
 * ├── custom-instructions.md
 * └── config/
 *     └── settings.json
 *
 * /Users/john/my-project/
 * ├── .researcherry/                    # Project-local configuration directory
 * │   ├── rules/
 * │   │   └── rules.md     # Overrides global rules
 * │   └── project-notes.md
 * └── src/
 *     └── index.ts
 * ```
 */
export function getResearcherryDirectoriesForCwd(cwd: string): string[] {
	const directories: string[] = []

	// Add global directory first
	directories.push(getGlobalResearcherryDirectory())

	// Add project-local directory second
	directories.push(getProjectResearcherryDirectoryForCwd(cwd))

	return directories
}

/**
 * Loads configuration from multiple .researcherry directories with project overriding global
 *
 * @param relativePath - The relative path within each .researcherry directory (e.g., 'rules/rules.md')
 * @param cwd - Current working directory (project path)
 * @returns Object with global and project content, plus merged content
 *
 * @example
 * ```typescript
 * // Load rules configuration for a project
 * const config = await loadConfiguration('rules/rules.md', '/Users/john/my-project')
 *
 * // Returns:
 * // {
 * //   global: "Global rules content...",     // From ~/.researcherry/rules/rules.md
 * //   project: "Project rules content...",   // From /Users/john/my-project/.researcherry/rules/rules.md
 * //   merged: "Global rules content...\n\n# Project-specific rules (override global):\n\nProject rules content..."
 * // }
 * ```
 *
 * @example File paths resolved:
 * ```
 * relativePath: 'rules/rules.md'
 * cwd: '/Users/john/my-project'
 *
 * Reads from:
 * - Global: /Users/john/.researcherry/rules/rules.md
 * - Project: /Users/john/my-project/.researcherry/rules/rules.md
 *
 * Other common relativePath examples:
 * - 'custom-instructions.md'
 * - 'config/settings.json'
 * - 'templates/component.tsx'
 * ```
 *
 * @example Merging behavior:
 * ```
 * // If only global exists:
 * { global: "content", project: null, merged: "content" }
 *
 * // If only project exists:
 * { global: null, project: "content", merged: "content" }
 *
 * // If both exist:
 * {
 *   global: "global content",
 *   project: "project content",
 *   merged: "global content\n\n# Project-specific rules (override global):\n\nproject content"
 * }
 * ```
 */
export async function loadConfiguration(
	relativePath: string,
	cwd: string,
): Promise<{
	global: string | null
	project: string | null
	merged: string
}> {
	const globalDir = getGlobalResearcherryDirectory()
	const projectDir = getProjectResearcherryDirectoryForCwd(cwd)

	const globalFilePath = path.join(globalDir, relativePath)
	const projectFilePath = path.join(projectDir, relativePath)

	// Read global configuration
	const globalContent = await readFileIfExists(globalFilePath)

	// Read project-local configuration
	const projectContent = await readFileIfExists(projectFilePath)

	// Merge configurations - project overrides global
	let merged = ""

	if (globalContent) {
		merged += globalContent
	}

	if (projectContent) {
		if (merged) {
			merged += "\n\n# Project-specific rules (override global):\n\n"
		}
		merged += projectContent
	}

	return {
		global: globalContent,
		project: projectContent,
		merged,
	}
}
