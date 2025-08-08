import { getAttemptCompletionDescription } from "../attempt-completion"

describe("getAttemptCompletionDescription", () => {
	it("should NOT include command parameter in the description", () => {
		const description = getAttemptCompletionDescription()

		// Should not contain command parameter
		expect(description).not.toContain("- command:")
		expect(description).not.toContain("command parameter")

		// But should still have the basic structure
		expect(description).toContain("## attempt_completion")
		expect(description).toContain("- result: (обязательно)")
		expect(description).toContain("<attempt_completion>")
		expect(description).toContain("</attempt_completion>")
	})

	it("should work when no args provided", () => {
		const description = getAttemptCompletionDescription()

		// Should contain core functionality
		expect(description).toContain("После каждого использования инструмента пользователь ответит результатом")
		expect(description).toContain("Как только вы получили результаты использования инструментов")

		// But should still have the basic structure
		expect(description).toContain("## attempt_completion")
		expect(description).toContain("- result: (обязательно)")
		expect(description).toContain("<attempt_completion>")
		expect(description).toContain("</attempt_completion>")
	})

	it("should show example without command", () => {
		const description = getAttemptCompletionDescription()

		// Check example format
		expect(description).toContain("Пример: Запрос на попытку завершения с результатом")
		expect(description).toContain("Я обновил CSS")
		expect(description).not.toContain("Example: Requesting to attempt completion with a result and command")
	})

	it("should contain core functionality description", () => {
		const description = getAttemptCompletionDescription()

		// Should contain core functionality
		const coreText = "После каждого использования инструмента пользователь ответит результатом"
		expect(description).toContain(coreText)

		// Should contain the important note
		expect(description).toContain("ВАЖНОЕ ПРИМЕЧАНИЕ: Этот инструмент НЕ МОЖЕТ быть использован")
		expect(description).toContain(
			"подтвердили ли вы от пользователя, что любые предыдущие использования инструментов были успешными",
		)
	})
})
