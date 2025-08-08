# MCP (Model Context Protocol)

MCP (Model Context Protocol) - это протокол, который позволяет расширять возможности Researcherry неограниченным количеством пользовательских инструментов и интеграций.

## Что такое MCP?

MCP - это открытый протокол, который позволяет:

- Подключать внешние инструменты к Researcherry
- Интегрироваться с базами данных
- Работать с внешними API
- Создавать пользовательские сервисы
- Расширять функциональность без ограничений

## Основные концепции

### MCP Сервер

MCP сервер - это приложение, которое предоставляет инструменты Researcherry:

- Обрабатывает запросы от Researcherry
- Выполняет действия
- Возвращает результаты
- Управляет ресурсами

### Инструменты (Tools)

Инструменты - это функции, которые MCP сервер предоставляет:

- Чтение файлов
- Выполнение команд
- Работа с API
- Управление данными

### Ресурсы (Resources)

Ресурсы - это данные, которые MCP сервер может предоставить:

- Файлы
- Базы данных
- Внешние сервисы
- Системная информация

## Установка и настройка

### Установка MCP сервера

```bash
# Установка через npm
npm install -g @modelcontextprotocol/server

# Установка через pip
pip install mcp-server

# Установка через go
go install github.com/modelcontextprotocol/server@latest
```

### Настройка в Researcherry

1. Откройте настройки Researcherry
2. Перейдите в раздел "MCP"
3. Нажмите "Add MCP Server"
4. Укажите путь к серверу и параметры

### Пример конфигурации

```yaml
mcp_servers:
    - name: "file-server"
      command: "mcp-server-filesystem"
      args: ["--root", "/path/to/root"]
    - name: "database-server"
      command: "mcp-server-postgres"
      args: ["--connection-string", "postgresql://user:pass@localhost/db"]
```

## Популярные MCP серверы

### Файловая система

```bash
# Установка
npm install -g @modelcontextprotocol/server-filesystem

# Запуск
mcp-server-filesystem --root /path/to/root
```

### База данных PostgreSQL

```bash
# Установка
npm install -g @modelcontextprotocol/server-postgres

# Запуск
mcp-server-postgres --connection-string "postgresql://user:pass@localhost/db"
```

### GitHub

```bash
# Установка
npm install -g @modelcontextprotocol/server-github

# Запуск
mcp-server-github --token YOUR_GITHUB_TOKEN
```

### Slack

```bash
# Установка
npm install -g @modelcontextprotocol/server-slack

# Запуск
mcp-server-slack --token YOUR_SLACK_TOKEN
```

## Создание собственного MCP сервера

### Простой пример на JavaScript

```javascript
const { Server } = require("@modelcontextprotocol/server")

const server = new Server({
	name: "my-custom-server",
	version: "1.0.0",
})

// Определение инструментов
server.listTools(() => [
	{
		name: "hello_world",
		description: "Приветствует пользователя",
		inputSchema: {
			type: "object",
			properties: {
				name: { type: "string", description: "Имя пользователя" },
			},
			required: ["name"],
		},
	},
	{
		name: "calculate",
		description: "Выполняет математические операции",
		inputSchema: {
			type: "object",
			properties: {
				operation: { type: "string", enum: ["add", "subtract", "multiply", "divide"] },
				a: { type: "number" },
				b: { type: "number" },
			},
			required: ["operation", "a", "b"],
		},
	},
])

// Обработка вызовов инструментов
server.callTool("hello_world", async (args) => {
	return { content: `Привет, ${args.name}!` }
})

server.callTool("calculate", async (args) => {
	const { operation, a, b } = args
	let result

	switch (operation) {
		case "add":
			result = a + b
			break
		case "subtract":
			result = a - b
			break
		case "multiply":
			result = a * b
			break
		case "divide":
			result = a / b
			break
		default:
			throw new Error("Неизвестная операция")
	}

	return { content: `Результат: ${result}` }
})

// Запуск сервера
server.listen()
```

### Пример на Python

```python
from mcp.server import Server
from mcp.server.models import Tool
from mcp.server.stdio import stdio_server
import asyncio

# Создание сервера
server = Server("my-python-server")

# Определение инструментов
@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="hello_world",
            description="Приветствует пользователя",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Имя пользователя"}
                },
                "required": ["name"]
            }
        )
    ]

# Обработка вызовов
@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[dict]:
    if name == "hello_world":
        return [{"type": "text", "text": f"Привет, {arguments['name']}!"}]

    raise ValueError(f"Неизвестный инструмент: {name}")

# Запуск сервера
async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream)

if __name__ == "__main__":
    asyncio.run(main())
```

## Использование MCP в Researcherry

### Прямые команды

```
/mcp hello_world --name "Иван"
/mcp calculate --operation add --a 5 --b 3
```

### Естественный язык

```
Поприветствуй пользователя с именем Иван
Вычисли 5 плюс 3
Получи список файлов в папке проекта
```

### Комбинирование с другими инструментами

```
Создай файл с результатом вычисления 10 * 5
Открой GitHub репозиторий и покажи последние коммиты
```

## Безопасность MCP

### Рекомендации по безопасности

1. **Проверяйте MCP серверы** перед установкой
2. **Используйте токены** для аутентификации
3. **Ограничивайте права доступа** серверов
4. **Регулярно обновляйте** MCP серверы
5. **Мониторьте активность** серверов

### Настройка безопасности

```yaml
security:
    allowed_servers:
        - "file-server"
        - "database-server"
    restricted_commands:
        - "rm -rf"
        - "sudo"
    token_validation: true
    activity_logging: true
```

## Устранение неполадок

### MCP сервер не запускается

1. Проверьте правильность команды
2. Убедитесь, что сервер установлен
3. Проверьте права доступа
4. Посмотрите логи ошибок

### Инструменты не работают

1. Проверьте схему инструмента
2. Убедитесь в правильности аргументов
3. Проверьте подключение к серверу
4. Тестируйте сервер отдельно

### Проблемы с производительностью

1. Оптимизируйте MCP сервер
2. Используйте кэширование
3. Ограничьте количество одновременных запросов
4. Мониторьте использование ресурсов

## Советы по использованию

### 1. Выбирайте подходящие серверы

- Для файловых операций → filesystem server
- Для баз данных → database server
- Для API интеграций → соответствующие серверы

### 2. Создавайте специализированные серверы

- Для ваших проектов
- Для командных нужд
- Для специфичных задач

### 3. Документируйте серверы

- Описывайте назначение
- Документируйте инструменты
- Приводите примеры использования

### 4. Тестируйте перед использованием

- Проверяйте функциональность
- Тестируйте безопасность
- Валидируйте производительность

## Следующие шаги

Теперь, когда вы знакомы с MCP, изучите:

- [FAQ](../faq.md)
- [Примеры интеграций](../examples.md)
