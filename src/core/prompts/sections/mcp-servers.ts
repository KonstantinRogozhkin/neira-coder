import { DiffStrategy } from "../../../shared/tools"
import { McpHub } from "../../../services/mcp/McpHub"

export async function getMcpServersSection(
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	enableMcpServerCreation?: boolean,
): Promise<string> {
	if (!mcpHub) {
		return ""
	}

	const connectedServers =
		mcpHub.getServers().length > 0
			? `${mcpHub
					.getServers()
					.filter((server) => server.status === "connected")
					.map((server) => {
						const tools = server.tools
							?.filter((tool) => tool.enabledForPrompt !== false)
							?.map((tool) => {
								const schemaStr = tool.inputSchema
									? `    Схема ввода:
		${JSON.stringify(tool.inputSchema, null, 2).split("\n").join("\n    ")}`
									: ""

								return `- ${tool.name}: ${tool.description}\n${schemaStr}`
							})
							.join("\n\n")

						const templates = server.resourceTemplates
							?.map((template) => `- ${template.uriTemplate} (${template.name}): ${template.description}`)
							.join("\n")

						const resources = server.resources
							?.map((resource) => `- ${resource.uri} (${resource.name}): ${resource.description}`)
							.join("\n")

						const config = JSON.parse(server.config)

						return (
							`## ${server.name}${config.command ? ` (\`${config.command}${config.args && Array.isArray(config.args) ? ` ${config.args.join(" ")}` : ""}\`)` : ""}` +
							(server.instructions ? `\n\n### Инструкции\n${server.instructions}` : "") +
							(tools ? `\n\n### Доступные инструменты\n${tools}` : "") +
							(templates ? `\n\n### Шаблоны ресурсов\n${templates}` : "") +
							(resources ? `\n\n### Прямые ресурсы\n${resources}` : "")
						)
					})
					.join("\n\n")}`
			: "(В настоящее время нет подключенных MCP серверов)"

	const baseSection = `MCP СЕРВЕРЫ

Протокол Model Context Protocol (MCP) обеспечивает связь между системой и MCP серверами, которые предоставляют дополнительные инструменты и ресурсы для расширения ваших возможностей. MCP серверы могут быть одного из двух типов:

1. Локальные (на основе Stdio) серверы: Они работают локально на машине пользователя и общаются через стандартный ввод/вывод
2. Удаленные (на основе SSE) серверы: Они работают на удаленных машинах и общаются через Server-Sent Events (SSE) по HTTP/HTTPS

# Подключенные MCP серверы

Когда сервер подключен, вы можете использовать инструменты сервера через инструмент \`use_mcp_tool\` и получить доступ к ресурсам сервера через инструмент \`access_mcp_resource\`.

${connectedServers}`

	if (!enableMcpServerCreation) {
		return baseSection
	}

	return (
		baseSection +
		`
## Создание MCP сервера

Пользователь может попросить вас что-то вроде "добавить инструмент", который выполняет какую-то функцию, другими словами, создать MCP сервер, который предоставляет инструменты и ресурсы, которые могут подключаться к внешним API, например. Если они это делают, вы должны получить подробные инструкции по этой теме, используя инструмент fetch_instructions, например:
<fetch_instructions>
<task>create_mcp_server</task>
</fetch_instructions>`
	)
}
