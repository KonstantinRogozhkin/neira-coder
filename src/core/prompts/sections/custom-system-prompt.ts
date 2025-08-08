import fs from "fs/promises"
import path from "path"
import { Mode } from "../../../shared/modes"
import { fileExistsAtPath } from "../../../utils/fs"

export type PromptVariables = {
	workspace?: string
	mode?: string
	language?: string
	shell?: string
	operatingSystem?: string
}

function interpolatePromptContent(content: string, variables: PromptVariables): string {
	let interpolatedContent = content
	for (const key in variables) {
		if (
			Object.prototype.hasOwnProperty.call(variables, key) &&
			variables[key as keyof PromptVariables] !== undefined
		) {
			const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g")
			interpolatedContent = interpolatedContent.replace(placeholder, variables[key as keyof PromptVariables]!)
		}
	}
	return interpolatedContent
}

/**
 * Безопасно читает файл, возвращая пустую строку, если файл не существует
 */
async function safeReadFile(filePath: string): Promise<string> {
	try {
		const content = await fs.readFile(filePath, "utf-8")
		// При чтении с кодировкой "utf-8" содержимое должно быть строкой
		return content.trim()
	} catch (err) {
		const errorCode = (err as NodeJS.ErrnoException).code
		if (!errorCode || !["ENOENT", "EISDIR"].includes(errorCode)) {
			throw err
		}
		return ""
	}
}

/**
 * Получает путь к файлу системного промпта для конкретного режима
 */
export function getSystemPromptFilePath(cwd: string, mode: Mode): string {
	return path.join(cwd, ".researcherry", `system-prompt-${mode}`)
}

/**
 * Загружает пользовательский системный промпт из файла по пути .researcherry/system-prompt-[slug режима]
 * Если файл не существует, возвращает пустую строку
 */
export async function loadSystemPromptFile(cwd: string, mode: Mode, variables: PromptVariables): Promise<string> {
	const filePath = getSystemPromptFilePath(cwd, mode)
	const rawContent = await safeReadFile(filePath)
	if (!rawContent) {
		return ""
	}
	const interpolatedContent = interpolatePromptContent(rawContent, variables)
	return interpolatedContent
}

/**
 * Обеспечивает существование директории .researcherry, создавая ее при необходимости
 */
export async function ensureRooDirectory(cwd: string): Promise<void> {
	const rooDir = path.join(cwd, ".researcherry")

	// Проверяем, существует ли директория уже
	if (await fileExistsAtPath(rooDir)) {
		return
	}

	// Создаем директорию
	try {
		await fs.mkdir(rooDir, { recursive: true })
	} catch (err) {
		// Если директория уже существует (условие гонки), игнорируем ошибку
		const errorCode = (err as NodeJS.ErrnoException).code
		if (errorCode !== "EEXIST") {
			throw err
		}
	}
}
