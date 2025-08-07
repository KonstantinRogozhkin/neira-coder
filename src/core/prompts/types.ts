/**
 * Настройки, передаваемые в функции генерации системного промпта
 */
export interface SystemPromptSettings {
	maxConcurrentFileReads: number
	todoListEnabled: boolean
	useAgentRules: boolean
}
