import { ToolArgs } from "./types"

export function getReadFileDescription(args: ToolArgs): string {
	const maxConcurrentReads = args.settings?.maxConcurrentFileReads ?? 5
	const isMultipleReadsEnabled = maxConcurrentReads > 1

	return `## read_file
Описание: Запрос на чтение содержимого ${isMultipleReadsEnabled ? "одного или нескольких файлов" : "файла"}. Инструмент выводит пронумерованное по строкам содержимое (например, "1 | const x = 1") для легкой ссылки при создании различий или обсуждении кода.${args.partialReadsEnabled ? " Используйте диапазоны строк для эффективного чтения конкретных частей больших файлов." : ""} Поддерживает извлечение текста из PDF и DOCX файлов, но может не обрабатывать другие двоичные файлы должным образом.

${isMultipleReadsEnabled ? `**ВАЖНО: Вы можете прочитать максимум ${maxConcurrentReads} файлов в одном запросе.** Если вам нужно прочитать больше файлов, используйте несколько последовательных запросов read_file.` : "**ВАЖНО: Множественное чтение файлов в настоящее время отключено. Вы можете читать только один файл за раз.**"}

${args.partialReadsEnabled ? `Указывая диапазоны строк, вы можете эффективно читать конкретные части больших файлов без загрузки всего файла в память.` : ""}
Параметры:
- args: Содержит один или несколько элементов файла, где каждый файл содержит:
  - path: (обязательно) Путь к файлу (относительно рабочей директории ${args.cwd})
  ${args.partialReadsEnabled ? `- line_range: (необязательно) Один или несколько элементов диапазона строк в формате "начало-конец" (начиная с 1, включительно)` : ""}

Использование:
<read_file>
<args>
  <file>
    <path>путь/к/файлу</path>
    ${args.partialReadsEnabled ? `<line_range>начало-конец</line_range>` : ""}
  </file>
</args>
</read_file>

Примеры:

1. Чтение одного файла:
<read_file>
<args>
  <file>
    <path>src/app.ts</path>
    ${args.partialReadsEnabled ? `<line_range>1-1000</line_range>` : ""}
  </file>
</args>
</read_file>

${isMultipleReadsEnabled ? `2. Чтение нескольких файлов (в пределах лимита ${maxConcurrentReads} файлов):` : ""}${
		isMultipleReadsEnabled
			? `
<read_file>
<args>
  <file>
    <path>src/app.ts</path>
    ${
		args.partialReadsEnabled
			? `<line_range>1-50</line_range>
    <line_range>100-150</line_range>`
			: ""
	}
  </file>
  <file>
    <path>src/utils.ts</path>
    ${args.partialReadsEnabled ? `<line_range>10-20</line_range>` : ""}
  </file>
</args>
</read_file>`
			: ""
	}

${isMultipleReadsEnabled ? "3. " : "2. "}Чтение всего файла:
<read_file>
<args>
  <file>
    <path>config.json</path>
  </file>
</args>
</read_file>

ВАЖНО: Вы ДОЛЖНЫ использовать эту Эффективную Стратегию Чтения:
- ${isMultipleReadsEnabled ? `Вы ДОЛЖНЫ читать все связанные файлы и реализации вместе в одной операции (до ${maxConcurrentReads} файлов одновременно)` : "Вы ДОЛЖНЫ читать файлы по одному, поскольку множественное чтение файлов в настоящее время отключено"}
- Вы ДОЛЖНЫ получить весь необходимый контекст перед продолжением с изменениями
${
	args.partialReadsEnabled
		? `- Вы ДОЛЖНЫ использовать диапазоны строк для чтения конкретных частей больших файлов, а не читать весь файл, когда это не нужно
- Вы ДОЛЖНЫ объединять соседние диапазоны строк (<10 строк друг от друга)
- Вы ДОЛЖНЫ использовать несколько диапазонов для содержимого, разделенного >10 строками
- Вы ДОЛЖНЫ включать достаточный контекст строк для запланированных изменений, сохраняя диапазоны минимальными
`
		: ""
}
${isMultipleReadsEnabled ? `- Когда вам нужно прочитать больше ${maxConcurrentReads} файлов, сначала приоритизируйте наиболее критичные файлы, затем используйте последующие запросы read_file для дополнительных файлов` : ""}`
}
