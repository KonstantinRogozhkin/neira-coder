import path from "path"
import { RooProtectedController } from "../RooProtectedController"

describe("RooProtectedController", () => {
	const TEST_CWD = "/test/workspace"
	let controller: RooProtectedController

	beforeEach(() => {
		controller = new RooProtectedController(TEST_CWD)
	})

	describe("isWriteProtected", () => {
		it("should protect .researcherryignore file", () => {
			expect(controller.isWriteProtected(".researcherryignore")).toBe(true)
		})

		it("should protect files in .researcherry directory", () => {
			expect(controller.isWriteProtected(".researcherry/config.json")).toBe(true)
			expect(controller.isWriteProtected(".researcherry/settings/user.json")).toBe(true)
			expect(controller.isWriteProtected(".researcherry/modes/custom.json")).toBe(true)
		})

		it("should protect .researcherryprotected file", () => {
			expect(controller.isWriteProtected(".researcherryprotected")).toBe(true)
		})

		it("should protect .researcherry-modes files", () => {
			expect(controller.isWriteProtected(".researcherry-modes")).toBe(true)
		})

		it("should protect .researcherryrules* files", () => {
			expect(controller.isWriteProtected(".researcherryrules")).toBe(true)
			expect(controller.isWriteProtected(".researcherryrules.md")).toBe(true)
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

		it("should not protect other files starting with .researcherry", () => {
			expect(controller.isWriteProtected(".researcherrysettings")).toBe(false)
			expect(controller.isWriteProtected(".researcherryconfig")).toBe(false)
		})

		it("should not protect regular files", () => {
			expect(controller.isWriteProtected("src/index.ts")).toBe(false)
			expect(controller.isWriteProtected("package.json")).toBe(false)
			expect(controller.isWriteProtected("README.md")).toBe(false)
		})

		it("should not protect files that contain 'researcherry' but don't start with .researcherry", () => {
			expect(controller.isWriteProtected("src/roo-utils.ts")).toBe(false)
			expect(controller.isWriteProtected("config/roo.config.js")).toBe(false)
		})

		it("should handle nested paths correctly", () => {
			expect(controller.isWriteProtected(".researcherry/config.json")).toBe(true) // .researcherry/** matches at root
			expect(controller.isWriteProtected("nested/.researcherryignore")).toBe(true) // .researcherryignore matches anywhere by default
			expect(controller.isWriteProtected("nested/.researcherry-modes")).toBe(true) // .researcherry-modes matches anywhere by default
			expect(controller.isWriteProtected("nested/.researcherryrules.md")).toBe(true) // .researcherryrules* matches anywhere by default
		})

		it("should handle absolute paths by converting to relative", () => {
			const absolutePath = path.join(TEST_CWD, ".researcherryignore")
			expect(controller.isWriteProtected(absolutePath)).toBe(true)
		})

		it("should handle paths with different separators", () => {
			expect(controller.isWriteProtected(".researcherry\\config.json")).toBe(true)
			expect(controller.isWriteProtected(".researcherry/config.json")).toBe(true)
		})
	})

	describe("getProtectedFiles", () => {
		it("should return set of protected files from a list", () => {
			const files = [
				"src/index.ts",
				".researcherryignore",
				"package.json",
				".researcherry/config.json",
				"README.md",
			]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set([".researcherryignore", ".researcherry/config.json"]))
		})

		it("should return empty set when no files are protected", () => {
			const files = ["src/index.ts", "package.json", "README.md"]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set())
		})
	})

	describe("annotatePathsWithProtection", () => {
		it("should annotate paths with protection status", () => {
			const files = ["src/index.ts", ".researcherryignore", ".researcherry/config.json", "package.json"]

			const annotated = controller.annotatePathsWithProtection(files)

			expect(annotated).toEqual([
				{ path: "src/index.ts", isProtected: false },
				{ path: ".researcherryignore", isProtected: true },
				{ path: ".researcherry/config.json", isProtected: true },
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
			expect(instructions).toContain(".researcherryignore")
			expect(instructions).toContain(".researcherry/**")
			expect(instructions).toContain("\u{1F6E1}") // Shield symbol
		})
	})

	describe("getProtectedPatterns", () => {
		it("should return the list of protected patterns", () => {
			const patterns = RooProtectedController.getProtectedPatterns()

			expect(patterns).toEqual([
				".researcherryignore",
				".researcherry-modes",
				".researcherryrules*",
				".clinerules*",
				".researcherry/**",
				".vscode/**",
				".researcherryprotected",
				"AGENTS.md",
			])
		})
	})
})
