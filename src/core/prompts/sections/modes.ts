import * as path from "path"
import * as vscode from "vscode"
import { promises as fs } from "fs"

import type { ModeConfig } from "@researcherry-ai/types"

import { getAllModesWithPrompts } from "../../../shared/modes"

export async function getModesSection(context: vscode.ExtensionContext): Promise<string> {
	const settingsDir = path.join(context.globalStorageUri.fsPath, "settings")
	await fs.mkdir(settingsDir, { recursive: true })

	// Get all modes with their overrides from extension state
	const allModes = await getAllModesWithPrompts(context)

	let modesContent = `====

РЕЖИМЫ

- Это текущие доступные режимы:
${allModes
	.map((mode: ModeConfig) => {
		let description: string
		if (mode.whenToUse && mode.whenToUse.trim() !== "") {
			// Use whenToUse as the primary description, indenting subsequent lines for readability
			description = mode.whenToUse.replace(/\n/g, "\n    ")
		} else {
			// Fallback to the first sentence of roleDefinition if whenToUse is not available
			description = mode.roleDefinition.split(".")[0]
		}
		return `  * Режим "${mode.name}" (${mode.slug}) - ${description}`
	})
	.join("\n")}`

	modesContent += `
Если пользователь просит вас создать или отредактировать новый режим для этого проекта, вы должны прочитать инструкции, используя инструмент fetch_instructions, например:
<fetch_instructions>
<task>create_mode</task>
</fetch_instructions>
`

	return modesContent
}
