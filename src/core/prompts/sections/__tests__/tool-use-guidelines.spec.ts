import { getToolUseGuidelinesSection } from "../tool-use-guidelines"
import type { CodeIndexManager } from "../../../../services/code-index/manager"

describe("getToolUseGuidelinesSection", () => {
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
		it("should include codebase_search first enforcement", () => {
			const guidelines = getToolUseGuidelinesSection(mockCodeIndexManagerEnabled)

			// Check that the guidelines include the codebase_search enforcement
			expect(guidelines).toContain(
				"КРИТИЧЕСКИ ВАЖНО: Для ЛЮБОГО исследования кода, который вы еще не изучили в этом разговоре, вы ОБЯЗАТЕЛЬНО должны сначала использовать инструмент `codebase_search`",
			)
			expect(guidelines).toContain("ПЕРЕД любыми другими инструментами поиска или исследования файлов")
			expect(guidelines).toContain("Это применяется на протяжении всего разговора, а не только в начале")
		})

		it("should maintain proper numbering with codebase_search", () => {
			const guidelines = getToolUseGuidelinesSection(mockCodeIndexManagerEnabled)

			// Check that all numbered items are present
			expect(guidelines).toContain("1. В тегах <thinking>")
			expect(guidelines).toContain("2. **КРИТИЧЕСКИ ВАЖНО:")
			expect(guidelines).toContain("3. Выберите наиболее подходящий инструмент")
			expect(guidelines).toContain("4. Если требуется несколько действий")
			expect(guidelines).toContain("5. Сформулируйте ваше использование инструмента")
			expect(guidelines).toContain("6. После каждого использования инструмента")
			expect(guidelines).toContain("7. ВСЕГДА ждите подтверждения")
		})
	})

	describe("when codebase_search is not available", () => {
		it("should not include codebase_search enforcement", () => {
			const guidelines = getToolUseGuidelinesSection(mockCodeIndexManagerDisabled)

			// Check that the guidelines do not include the codebase_search enforcement
			expect(guidelines).not.toContain("КРИТИЧЕСКИ ВАЖНО: Для ЛЮБОГО исследования кода")
			expect(guidelines).not.toContain("ПЕРЕД любыми другими инструментами поиска")
		})

		it("should maintain proper numbering without codebase_search", () => {
			const guidelines = getToolUseGuidelinesSection(mockCodeIndexManagerDisabled)

			// Check that all numbered items are present with correct numbering
			expect(guidelines).toContain("1. В тегах <thinking>")
			expect(guidelines).toContain("2. Выберите наиболее подходящий инструмент")
			expect(guidelines).toContain("3. Если требуется несколько действий")
			expect(guidelines).toContain("4. Сформулируйте ваше использование инструмента")
			expect(guidelines).toContain("5. После каждого использования инструмента")
			expect(guidelines).toContain("6. ВСЕГДА ждите подтверждения")
		})
	})

	it("should include iterative process guidelines regardless of codebase_search availability", () => {
		const guidelinesEnabled = getToolUseGuidelinesSection(mockCodeIndexManagerEnabled)
		const guidelinesDisabled = getToolUseGuidelinesSection(mockCodeIndexManagerDisabled)

		// Check that the iterative process section is included in both cases
		for (const guidelines of [guidelinesEnabled, guidelinesDisabled]) {
			expect(guidelines).toContain("Критически важно действовать пошагово")
			expect(guidelines).toContain("1. Подтвердить успех каждого шага перед продолжением")
			expect(guidelines).toContain("2. Решить любые проблемы или ошибки, которые возникают немедленно")
			expect(guidelines).toContain(
				"3. Адаптировать ваш подход на основе новой информации или неожиданных результатов",
			)
			expect(guidelines).toContain("4. Обеспечить, чтобы каждое действие правильно строилось на предыдущих")
		}
	})
})
