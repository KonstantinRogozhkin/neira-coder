import { Anthropic } from "@anthropic-ai/sdk"
import * as path from "path"
import * as diff from "diff"
import { RooIgnoreController, LOCK_TEXT_SYMBOL } from "../ignore/RooIgnoreController"
import { RooProtectedController } from "../protect/RooProtectedController"

export const formatResponse = {
	toolDenied: () => `Пользователь отклонил эту операцию.`,

	toolDeniedWithFeedback: (feedback?: string) =>
		`Пользователь отклонил эту операцию и предоставил следующую обратную связь:\n<feedback>\n${feedback}\n</feedback>`,

	toolApprovedWithFeedback: (feedback?: string) =>
		`Пользователь одобрил эту операцию и предоставил следующий контекст:\n<feedback>\n${feedback}\n</feedback>`,

	toolError: (error?: string) =>
		`Выполнение инструмента не удалось со следующей ошибкой:\n<error>\n${error}\n</error>`,

	rooIgnoreError: (path: string) =>
		`Доступ к ${path} заблокирован настройками файла .neiraignore. Вы должны попытаться продолжить задачу без использования этого файла, или попросить пользователя обновить файл .neiraignore.`,

	noToolsUsed: () =>
		`[ОШИБКА] Вы не использовали инструмент в вашем предыдущем ответе! Пожалуйста, повторите попытку с использованием инструмента.

${toolUseInstructionsReminder}

# Следующие шаги

Если вы завершили задачу пользователя, используйте инструмент attempt_completion. 
Если вам нужна дополнительная информация от пользователя, используйте инструмент ask_followup_question. 
В противном случае, если вы не завершили задачу и не нуждаетесь в дополнительной информации, то продолжайте со следующим шагом задачи. 
(Это автоматическое сообщение, поэтому не отвечайте на него разговорно.)`,

	tooManyMistakes: (feedback?: string) =>
		`Похоже, у вас возникают трудности с продолжением. Пользователь предоставил следующую обратную связь, чтобы помочь направить вас:\n<feedback>\n${feedback}\n</feedback>`,

	missingToolParameterError: (paramName: string) =>
		`Отсутствует значение для обязательного параметра '${paramName}'. Пожалуйста, повторите попытку с полным ответом.\n\n${toolUseInstructionsReminder}`,

	lineCountTruncationError: (actualLineCount: number, isNewFile: boolean, diffStrategyEnabled: boolean = false) => {
		const truncationMessage = `Примечание: Ваш ответ мог быть обрезан, потому что он превысил ваш лимит вывода. Вы написали ${actualLineCount} строк содержимого, но параметр line_count либо отсутствовал, либо не был включен в ваш ответ.`

		const newFileGuidance =
			`Это похоже на новый файл.\n` +
			`${truncationMessage}\n\n` +
			`РЕКОМЕНДУЕМЫЙ ПОДХОД:\n` +
			`1. Попробуйте снова с параметром line_count в вашем ответе, если вы забыли его включить\n` +
			`2. Или разбейте ваше содержимое на меньшие части - сначала используйте write_to_file с начальной частью\n` +
			`3. Затем используйте insert_content для добавления дополнительных частей\n`

		let existingFileApproaches = [
			`1. Попробуйте снова с параметром line_count в вашем ответе, если вы забыли его включить`,
		]

		if (diffStrategyEnabled) {
			existingFileApproaches.push(
				`2. Или попробуйте использовать apply_diff вместо write_to_file для целевых изменений`,
			)
		}

		existingFileApproaches.push(
			`${diffStrategyEnabled ? "3" : "2"}. Или используйте search_and_replace для замены конкретного текста`,
			`${diffStrategyEnabled ? "4" : "3"}. Или используйте insert_content для добавления конкретного содержимого на определенные строки`,
		)

		const existingFileGuidance =
			`Это похоже на содержимое для существующего файла.\n` +
			`${truncationMessage}\n\n` +
			`РЕКОМЕНДУЕМЫЙ ПОДХОД:\n` +
			`${existingFileApproaches.join("\n")}\n`

		return `${isNewFile ? newFileGuidance : existingFileGuidance}\n${toolUseInstructionsReminder}`
	},

	invalidMcpToolArgumentError: (serverName: string, toolName: string) =>
		`Неверный JSON аргумент использован с ${serverName} для ${toolName}. Пожалуйста, повторите попытку с правильно отформатированным JSON аргументом.`,

	toolResult: (
		text: string,
		images?: string[],
	): string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> => {
		if (images && images.length > 0) {
			const textBlock: Anthropic.TextBlockParam = { type: "text", text }
			const imageBlocks: Anthropic.ImageBlockParam[] = formatImagesIntoBlocks(images)
			// Размещение изображений после текста приводит к лучшим результатам
			return [textBlock, ...imageBlocks]
		} else {
			return text
		}
	},

	imageBlocks: (images?: string[]): Anthropic.ImageBlockParam[] => {
		return formatImagesIntoBlocks(images)
	},

	formatFilesList: (
		absolutePath: string,
		files: string[],
		didHitLimit: boolean,
		rooIgnoreController: RooIgnoreController | undefined,
		showNeiraIgnoredFiles: boolean,
		rooProtectedController?: RooProtectedController,
	): string => {
		const sorted = files
			.map((file) => {
				// конвертируем абсолютный путь в относительный путь
				const relativePath = path.relative(absolutePath, file).toPosix()
				return file.endsWith("/") ? relativePath + "/" : relativePath
			})
			// Сортируем так, чтобы файлы были перечислены под их соответствующими директориями, чтобы было ясно, какие файлы являются дочерними для каких директорий. Поскольку мы строим список файлов сверху вниз, даже если список файлов обрезан, он покажет директории, которые cline может затем исследовать дальше.
			.sort((a, b) => {
				const aParts = a.split("/") // работает только если мы сначала используем toPosix
				const bParts = b.split("/")
				for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
					if (aParts[i] !== bParts[i]) {
						// Если один является директорией, а другой нет на этом уровне, сортируем директорию первой
						if (i + 1 === aParts.length && i + 1 < bParts.length) {
							return -1
						}
						if (i + 1 === bParts.length && i + 1 < aParts.length) {
							return 1
						}
						// В противном случае сортируем по алфавиту
						return aParts[i].localeCompare(bParts[i], undefined, { numeric: true, sensitivity: "base" })
					}
				}
				// Если все части одинаковы до длины более короткого пути,
				// более короткий идет первым
				return aParts.length - bParts.length
			})

		let rooIgnoreParsed: string[] = sorted

		if (rooIgnoreController) {
			rooIgnoreParsed = []
			for (const filePath of sorted) {
				// путь относителен к абсолютному пути, а не к cwd
				// validateAccess ожидает либо путь относительно cwd, либо абсолютный путь
				// в противном случае для валидации против паттернов игнорирования типа "assets/icons" мы получили бы просто "icons", что привело бы к тому, что путь не игнорировался.
				const absoluteFilePath = path.resolve(absolutePath, filePath)
				const isIgnored = !rooIgnoreController.validateAccess(absoluteFilePath)

				if (isIgnored) {
					// Если файл игнорируется и мы не показываем игнорируемые файлы, пропускаем его
					if (!showNeiraIgnoredFiles) {
						continue
					}
					// В противном случае помечаем его символом блокировки
					rooIgnoreParsed.push(LOCK_TEXT_SYMBOL + " " + filePath)
				} else {
					// Проверяем, защищен ли файл от записи (только для неигнорируемых файлов)
					const isWriteProtected = rooProtectedController?.isWriteProtected(absoluteFilePath) || false
					if (isWriteProtected) {
						rooIgnoreParsed.push("🛡️ " + filePath)
					} else {
						rooIgnoreParsed.push(filePath)
					}
				}
			}
		}
		if (didHitLimit) {
			return `${rooIgnoreParsed.join(
				"\n",
			)}\n\n(Список файлов обрезан. Используйте list_files на конкретных поддиректориях, если вам нужно исследовать дальше.)`
		} else if (rooIgnoreParsed.length === 0 || (rooIgnoreParsed.length === 1 && rooIgnoreParsed[0] === "")) {
			return "Файлы не найдены."
		} else {
			return rooIgnoreParsed.join("\n")
		}
	},

	createPrettyPatch: (filename = "file", oldStr?: string, newStr?: string) => {
		// строки не могут быть undefined, иначе diff выбросит исключение
		const patch = diff.createPatch(filename.toPosix(), oldStr || "", newStr || "")
		const lines = patch.split("\n")
		const prettyPatchLines = lines.slice(4)
		return prettyPatchLines.join("\n")
	},
}

// чтобы избежать циклической зависимости
const formatImagesIntoBlocks = (images?: string[]): Anthropic.ImageBlockParam[] => {
	return images
		? images.map((dataUrl) => {
				// data:image/png;base64,base64string
				const [rest, base64] = dataUrl.split(",")
				const mimeType = rest.split(":")[1].split(";")[0]
				return {
					type: "image",
					source: { type: "base64", media_type: mimeType, data: base64 },
				} as Anthropic.ImageBlockParam
			})
		: []
}

const toolUseInstructionsReminder = `# Напоминание: Инструкции по использованию инструментов

Использование инструментов форматируется с помощью XML-подобных тегов. Само имя инструмента становится именем XML тега. Каждый параметр заключается в свой собственный набор тегов. Вот структура:

<actual_tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</actual_tool_name>

Например, для использования инструмента attempt_completion:

<attempt_completion>
<result>
Я завершил задачу...
</result>
</attempt_completion>

Всегда используйте фактическое имя инструмента как имя XML тега для правильного парсинга и выполнения.`
