import { getObjectiveSection } from "../objective"
import type { CodeIndexManager } from "../../../../services/code-index/manager"

describe("getObjectiveSection", () => {
	// Mock CodeIndexManager with codebase search available
	const mockCodeIndexManagerEnabled = {
		isFeatureEnabled: true,
		isFeatureConfigured: true,
		isInitialized: true,
	} as CodeIndexManager

	// Mock CodeIndexManager with codebase search unavailable
	const mockCodeIndexManagerDisabled = {
		isFeatureEnabled: false,
		isFeatureConfigured: false,
		isInitialized: false,
	} as CodeIndexManager

	describe("when codebase_search is available", () => {
		it("should include codebase_search first enforcement in thinking process", () => {
			const objective = getObjectiveSection(mockCodeIndexManagerEnabled)

			// Check that the objective includes the codebase_search enforcement
			expect(objective).toContain(
				"для ЛЮБОГО исследования кода, который вы еще не изучили в этом разговоре, вы ОБЯЗАТЕЛЬНО должны использовать инструмент `codebase_search`",
			)
			expect(objective).toContain("ПЕРЕД использованием любых других инструментов поиска или исследования файлов")
			expect(objective).toContain("Это применяется на протяжении всей задачи, а не только в начале")
		})
	})

	describe("when codebase_search is not available", () => {
		it("should not include codebase_search enforcement", () => {
			const objective = getObjectiveSection(mockCodeIndexManagerDisabled)

			// Check that the objective does not include the codebase_search enforcement
			expect(objective).not.toContain("вы ОБЯЗАТЕЛЬНО должны использовать инструмент `codebase_search`")
			expect(objective).not.toContain("ПЕРЕД использованием любых других инструментов поиска")
		})
	})

	it("should maintain proper structure regardless of codebase_search availability", () => {
		const objectiveEnabled = getObjectiveSection(mockCodeIndexManagerEnabled)
		const objectiveDisabled = getObjectiveSection(mockCodeIndexManagerDisabled)

		// Check that all numbered items are present in both cases
		for (const objective of [objectiveEnabled, objectiveDisabled]) {
			expect(objective).toContain("1. Проанализируйте задачу пользователя")
			expect(objective).toContain("2. Проработайте эти цели последовательно")
			expect(objective).toContain("3. Помните, что у вас есть обширные возможности")
			expect(objective).toContain("4. Как только вы завершили задачу пользователя")
			expect(objective).toContain("5. Пользователь может предоставить обратную связь")
		}
	})

	it("should include thinking tags guidance regardless of codebase_search availability", () => {
		const objectiveEnabled = getObjectiveSection(mockCodeIndexManagerEnabled)
		const objectiveDisabled = getObjectiveSection(mockCodeIndexManagerDisabled)

		// Check that thinking tags guidance is included in both cases
		for (const objective of [objectiveEnabled, objectiveDisabled]) {
			expect(objective).toContain("<thinking></thinking>")
			expect(objective).toContain("проанализируйте структуру файлов, предоставленную в environment_details")
			expect(objective).toContain(
				"подумайте о том, какой из предоставленных инструментов является наиболее релевантным",
			)
		}
	})

	it("should include parameter inference guidance regardless of codebase_search availability", () => {
		const objectiveEnabled = getObjectiveSection(mockCodeIndexManagerEnabled)
		const objectiveDisabled = getObjectiveSection(mockCodeIndexManagerDisabled)

		// Check parameter inference guidance in both cases
		for (const objective of [objectiveEnabled, objectiveDisabled]) {
			expect(objective).toContain("Пройдите через каждый из требуемых параметров релевантного инструмента")
			expect(objective).toContain(
				"определите, предоставил ли пользователь напрямую или дал достаточно информации для вывода значения",
			)
			expect(objective).toContain("НЕ вызывайте инструмент (даже с заполнителями для отсутствующих параметров)")
			expect(objective).toContain("ask_followup_question")
		}
	})
})
