import { McpHub } from "../../../services/mcp/McpHub"
import { DiffStrategy } from "../../../shared/tools"

export async function createMCPServerInstructions(
	mcpHub: McpHub | undefined,
	diffStrategy: DiffStrategy | undefined,
): Promise<string> {
	if (!diffStrategy || !mcpHub) throw new Error("Missing MCP Hub or Diff Strategy")

	return `У вас есть возможность создать MCP сервер и добавить его в файл конфигурации, который затем предоставит инструменты и ресурсы для использования с \`use_mcp_tool\` и \`access_mcp_resource\`.

При создании MCP серверов важно понимать, что они работают в неинтерактивной среде. Сервер не может инициировать OAuth потоки, открывать окна браузера или запрашивать пользовательский ввод во время выполнения. Все учетные данные и токены аутентификации должны быть предоставлены заранее через переменные окружения в конфигурации настроек MCP. Например, API Spotify использует OAuth для получения токена обновления для пользователя, но MCP сервер не может инициировать этот поток. Хотя вы можете провести пользователя через процесс получения ID клиента приложения и секрета, вам может потребоваться создать отдельный одноразовый скрипт настройки (например, get-refresh-token.js), который захватывает и логирует последний кусок головоломки: токен обновления пользователя (т.е. вы можете запустить скрипт, используя execute_command, который откроет браузер для аутентификации, а затем залогирует токен обновления, чтобы вы могли увидеть его в выводе команды для использования в конфигурации настроек MCP).

Если пользователь не укажет иное, новые локальные MCP серверы должны создаваться в: ${await mcpHub.getMcpServersPath()}

### Типы и конфигурация MCP серверов

MCP серверы можно настроить двумя способами в файле настроек MCP:

1. Конфигурация локального (Stdio) сервера:
\`\`\`json
{
	"mcpServers": {
		"local-weather": {
			"command": "node",
			"args": ["/path/to/weather-server/build/index.js"],
			"env": {
				"OPENWEATHER_API_KEY": "your-api-key"
			}
		}
	}
}
\`\`\`

2. Конфигурация удаленного (SSE) сервера:
\`\`\`json
{
	"mcpServers": {
		"remote-weather": {
			"url": "https://api.example.com/mcp",
			"headers": {
				"Authorization": "Bearer your-api-key"
			}
		}
	}
}
\`\`\`

Общие параметры конфигурации для обоих типов:
- \`disabled\`: (необязательно) Установите true для временного отключения сервера
- \`timeout\`: (необязательно) Максимальное время в секундах для ожидания ответов сервера (по умолчанию: 60)
- \`alwaysAllow\`: (необязательно) Массив имен инструментов, которые не требуют подтверждения пользователя
- \`disabledTools\`: (необязательно) Массив имен инструментов, которые не включаются в системный промпт и не будут использоваться

### Пример локального MCP сервера

Например, если пользователь хотел дать вам возможность получать информацию о погоде, вы могли бы создать MCP сервер, который использует OpenWeather API для получения информации о погоде, добавить его в файл конфигурации настроек MCP, а затем заметить, что у вас теперь есть доступ к новым инструментам и ресурсам в системном промпте, которые вы можете использовать, чтобы показать пользователю ваши новые возможности.

Следующий пример демонстрирует, как создать локальный MCP сервер, который предоставляет функциональность данных о погоде, используя транспорт Stdio. Хотя этот пример показывает, как реализовать ресурсы, шаблоны ресурсов и инструменты, на практике вы должны предпочитать использование инструментов, поскольку они более гибкие и могут обрабатывать динамические параметры. Реализации ресурсов и шаблонов ресурсов включены здесь в основном для демонстрационных целей различных возможностей MCP, но реальный сервер погоды, вероятно, просто предоставил бы инструменты для получения данных о погоде. (Следующие шаги для macOS)

1. Используйте инструмент \`create-typescript-server\` для создания нового проекта в директории MCP серверов по умолчанию:

\`\`\`bash
cd ${await mcpHub.getMcpServersPath()}
npx @modelcontextprotocol/create-server weather-server
cd weather-server
# Установить зависимости
npm install axios zod @modelcontextprotocol/sdk
\`\`\`

Это создаст новый проект со следующей структурой:

\`\`\`
weather-server/
	├── package.json
			{
				...
				"type": "module", // добавлено по умолчанию, использует синтаксис ES модулей (import/export) вместо CommonJS (require/module.exports) (Важно знать, если вы создаете дополнительные скрипты в этом репозитории сервера, как скрипт get-refresh-token.js)
				"scripts": {
					"build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
					...
				}
				...
			}
	├── tsconfig.json
	└── src/
			└── index.ts      # Основная реализация сервера
\`\`\`

2. Замените \`src/index.ts\` следующим:

\`\`\`typescript
#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY; // предоставляется конфигурацией MCP
if (!API_KEY) {
  throw new Error('OPENWEATHER_API_KEY environment variable is required');
}

// Определяем типы для ответов OpenWeather API
interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
}

interface ForecastData {
  list: Array<WeatherData & {
    dt_txt: string;
  }>;
}

// Создаем MCP сервер
const server = new McpServer({
  name: "weather-server",
  version: "0.1.0"
});

// Создаем экземпляр axios для OpenWeather API
const weatherApi = axios.create({
  baseURL: 'http://api.openweathermap.org/data/2.5',
  params: {
    appid: API_KEY,
    units: 'metric',
  },
});

// Добавляем инструмент для получения прогнозов погоды
server.tool(
  "get_forecast",
  {
    city: z.string().describe("Название города"),
    days: z.number().min(1).max(5).optional().describe("Количество дней (1-5)"),
  },
  async ({ city, days = 3 }) => {
    try {
      const response = await weatherApi.get<ForecastData>('forecast', {
        params: {
          q: city,
          cnt: Math.min(days, 5) * 8,
        },
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data.list, null, 2),
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          content: [
            {
              type: "text",
              text: \`Ошибка Weather API: \${
                error.response?.data.message ?? error.message
              }\`,
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  }
);

// Добавляем ресурс для текущей погоды в Сан-Франциско
server.resource(
  "sf_weather",
  { uri: "weather://San Francisco/current", list: true },
  async (uri) => {
    try {
      const response = weatherApi.get<WeatherData>('weather', {
        params: { q: "San Francisco" },
      });

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                temperature: response.data.main.temp,
                conditions: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                wind_speed: response.data.wind.speed,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(\`Ошибка Weather API: \${
          error.response?.data.message ?? error.message
        }\`);
      }
      throw error;
    }
  }
);

// Добавляем динамический шаблон ресурса для текущей погоды по городу
server.resource(
  "current_weather",
  new ResourceTemplate("weather://{city}/current", { list: true }),
  async (uri, { city }) => {
    try {
      const response = await weatherApi.get('weather', {
        params: { q: city },
      });

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                temperature: response.data.main.temp,
                conditions: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                wind_speed: response.data.wind.speed,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(\`Ошибка Weather API: \${
          error.response?.data.message ?? error.message
        }\`);
      }
      throw error;
    }
  }
);

// Начинаем получать сообщения на stdin и отправлять сообщения на stdout
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Weather MCP сервер работает на stdio');
\`\`\`

(Помните: Это просто пример–вы можете использовать разные зависимости, разбить реализацию на несколько файлов и т.д.)

3. Соберите и скомпилируйте исполняемый JavaScript файл

\`\`\`bash
npm run build
\`\`\`

4. Всякий раз, когда вам нужна переменная окружения, такая как API ключ для настройки MCP сервера, проведите пользователя через процесс получения ключа. Например, им может потребоваться создать аккаунт и перейти в панель разработчика для генерации ключа. Предоставьте пошаговые инструкции и URL-адреса, чтобы пользователю было легко получить необходимую информацию. Затем используйте инструмент ask_followup_question, чтобы попросить пользователя предоставить ключ, в данном случае ключ OpenWeather API.

5. Установите MCP сервер, добавив конфигурацию MCP сервера в файл настроек, расположенный по адресу '${await mcpHub.getMcpSettingsFilePath()}'. Файл настроек может уже содержать другие настроенные MCP серверы, поэтому вы сначала прочитаете его, а затем добавите ваш новый сервер в существующий объект \`mcpServers\`.

ВАЖНО: Независимо от того, что еще вы видите в файле настроек MCP, вы должны по умолчанию устанавливать для любых новых MCP серверов, которые вы создаете, disabled=false, alwaysAllow=[] и disabledTools=[].

\`\`\`json
{
	"mcpServers": {
		...,
		"weather": {
			"command": "node",
			"args": ["/path/to/weather-server/build/index.js"],
			"env": {
				"OPENWEATHER_API_KEY": "user-provided-api-key"
			}
		},
	}
}
\`\`\`

(Примечание: пользователь также может попросить вас установить MCP сервер в приложение Claude desktop, в этом случае вы прочитаете, а затем измените \`~/Library/Application\ Support/Claude/claude_desktop_config.json\` на macOS, например. Он следует тому же формату объекта верхнего уровня \`mcpServers\`.)

6. После того как вы отредактировали файл конфигурации настроек MCP, система автоматически запустит все серверы и предоставит доступные инструменты и ресурсы в разделе 'Подключенные MCP серверы'.

7. Теперь, когда у вас есть доступ к этим новым инструментам и ресурсам, вы можете предложить способы, которыми пользователь может приказать вам вызывать их - например, с этим новым инструментом погоды, теперь доступным, вы можете пригласить пользователя спросить "какая погода в Сан-Франциско?"

## Редактирование MCP серверов

Пользователь может попросить добавить инструменты или ресурсы, которые могут иметь смысл добавить к существующему MCP серверу (перечисленному в разделе 'Подключенные MCP серверы' выше: ${(() => {
		if (!mcpHub) return "(В настоящее время не запущено)"
		const servers = mcpHub
			.getServers()
			.map((server) => server.name)
			.join(", ")
		return servers || "(В настоящее время не запущено)"
	})()}, например, если он будет использовать тот же API. Это было бы возможно, если вы можете найти репозиторий MCP сервера в системе пользователя, посмотрев на аргументы сервера для пути к файлу. Вы можете затем использовать list_files и read_file для исследования файлов в репозитории, и использовать write_to_file${diffStrategy ? " или apply_diff" : ""} для внесения изменений в файлы.

Однако некоторые MCP серверы могут работать из установленных пакетов, а не из локального репозитория, в этом случае может иметь больше смысла создать новый MCP сервер.

# MCP серверы не всегда необходимы

Пользователь может не всегда запрашивать использование или создание MCP серверов. Вместо этого они могут предоставить задачи, которые можно выполнить с существующими инструментами. Хотя использование MCP SDK для расширения ваших возможностей может быть полезным, важно понимать, что это всего лишь один специализированный тип задачи, которую вы можете выполнить. Вы должны реализовывать MCP серверы только когда пользователь явно запрашивает это (например, "добавить инструмент, который...").

Помните: Документация MCP и пример, предоставленный выше, предназначены для того, чтобы помочь вам понять и работать с существующими MCP серверами или создавать новые, когда это запрашивается пользователем. У вас уже есть доступ к инструментам и возможностям, которые можно использовать для выполнения широкого спектра задач.`
}
