import path from "path"
import { RooProtectedController } from "../RooProtectedController"

describe("RooProtectedController", () => {
	const TEST_CWD = "/test/workspace"
	let controller: RooProtectedController

	beforeEach(() => {
		controller = new RooProtectedController(TEST_CWD)
	})

	describe("isWriteProtected", () => {
			it("should protect .neiraignore file", () => {
		expect(controller.isWriteProtected(".neiraignore")).toBe(true)
	})

		it("should protect files in .neira directory", () => {
			expect(controller.isWriteProtected(".neira/config.json")).toBe(true)
			expect(controller.isWriteProtected(".neira/settings/user.json")).toBe(true)
			expect(controller.isWriteProtected(".neira/modes/custom.json")).toBe(true)
		})

			it("should protect .neiraprotected file", () => {
		expect(controller.isWriteProtected(".neiraprotected")).toBe(true)
	})

			it("should protect .neira-modes files", () => {
		expect(controller.isWriteProtected(".neira-modes")).toBe(true)
	})

		it("should protect .neirarules* files", () => {
			expect(controller.isWriteProtected(".neirarules")).toBe(true)
			expect(controller.isWriteProtected(".neirarules.md")).toBe(true)
		})

		it("should protect .clinerules* files", () => {
			expect(controller.isWriteProtected(".clinerules")).toBe(true)
			expect(controller.isWriteProtected(".clinerules.md")).toBe(true)
		})

		it("should protect files in .vscode directory", () => {
			expect(controller.isWriteProtected(".vscode/settings.json")).toBe(true)
			expect(controller.isWriteProtected(".vscode/launch.json")).toBe(true)
			expect(controller.isWriteProtected(".vscode/tasks.json")).toBe(true)
		})

		it("should protect AGENTS.md file", () => {
			expect(controller.isWriteProtected("AGENTS.md")).toBe(true)
		})

			it("should not protect other files starting with .neira", () => {
		expect(controller.isWriteProtected(".neirasettings")).toBe(false)
		expect(controller.isWriteProtected(".neiraconfig")).toBe(false)
	})

		it("should not protect regular files", () => {
			expect(controller.isWriteProtected("src/index.ts")).toBe(false)
			expect(controller.isWriteProtected("package.json")).toBe(false)
			expect(controller.isWriteProtected("README.md")).toBe(false)
		})

		it("should not protect files that contain 'neira' but don't start with .neira", () => {
			expect(controller.isWriteProtected("src/roo-utils.ts")).toBe(false)
			expect(controller.isWriteProtected("config/roo.config.js")).toBe(false)
		})

		it("should handle nested paths correctly", () => {
			expect(controller.isWriteProtected(".neira/config.json")).toBe(true) // .neira/** matches at root
			expect(controller.isWriteProtected("nested/.neiraignore")).toBe(true) // .neiraignore matches anywhere by default
			expect(controller.isWriteProtected("nested/.neira-modes")).toBe(true) // .neira-modes matches anywhere by default
			expect(controller.isWriteProtected("nested/.neirarules.md")).toBe(true) // .neirarules* matches anywhere by default
		})

		it("should handle absolute paths by converting to relative", () => {
			const absolutePath = path.join(TEST_CWD, ".neiraignore")
			expect(controller.isWriteProtected(absolutePath)).toBe(true)
		})

		it("should handle paths with different separators", () => {
			expect(controller.isWriteProtected(".neira\\config.json")).toBe(true)
			expect(controller.isWriteProtected(".neira/config.json")).toBe(true)
		})
	})

	describe("getProtectedFiles", () => {
		it("should return set of protected files from a list", () => {
			const files = ["src/index.ts", ".neiraignore", "package.json", ".neira/config.json", "README.md"]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set([".neiraignore", ".neira/config.json"]))
		})

		it("should return empty set when no files are protected", () => {
			const files = ["src/index.ts", "package.json", "README.md"]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set())
		})
	})

	describe("annotatePathsWithProtection", () => {
		it("should annotate paths with protection status", () => {
			const files = ["src/index.ts", ".neiraignore", ".neira/config.json", "package.json"]

			const annotated = controller.annotatePathsWithProtection(files)

			expect(annotated).toEqual([
				{ path: "src/index.ts", isProtected: false },
				{ path: ".neiraignore", isProtected: true },
				{ path: ".neira/config.json", isProtected: true },
				{ path: "package.json", isProtected: false },
			])
		})
	})

	describe("getProtectionMessage", () => {
		it("should return appropriate protection message", () => {
			const message = controller.getProtectionMessage()
			expect(message).toBe("This is a Roo configuration file and requires approval for modifications")
		})
	})

	describe("getInstructions", () => {
		it("should return formatted instructions about protected files", () => {
			const instructions = controller.getInstructions()

			expect(instructions).toContain("# Protected Files")
			expect(instructions).toContain("write-protected")
			expect(instructions).toContain(".neiraignore")
			expect(instructions).toContain(".neira/**")
			expect(instructions).toContain("\u{1F6E1}") // Shield symbol
		})
	})

	describe("getProtectedPatterns", () => {
		it("should return the list of protected patterns", () => {
			const patterns = RooProtectedController.getProtectedPatterns()

			expect(patterns).toEqual([
				".neiraignore",
				".neira-modes",
				".neirarules*",
				".clinerules*",
				".neira/**",
				".vscode/**",
				".neiraprotected",
				"AGENTS.md",
			])
		})
	})
})
