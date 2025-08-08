# Пользовательские инструкции

Пользовательские инструкции позволяют настроить поведение Researcherry под ваши предпочтения и рабочие процессы.

## Что такое пользовательские инструкции?

Пользовательские инструкции - это настройки, которые определяют:

- Стиль общения Researcherry
- Предпочтения в коде
- Рабочие процессы
- Специфичные требования

## Настройка пользовательских инструкций

### Открытие настроек

1. Откройте Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Введите "Researcherry: Open Settings"
3. Перейдите в раздел "Custom Instructions"

### Основные разделы

#### 1. Стиль общения

```yaml
communication_style:
    tone: "professional" # professional, casual, friendly
    language: "russian" # russian, english, mixed
    detail_level: "detailed" # brief, detailed, comprehensive
    examples: true # включать ли примеры в ответы
```

#### 2. Предпочтения в коде

```yaml
code_preferences:
    language: "typescript" # предпочитаемый язык
    framework: "react" # предпочитаемый фреймворк
    style_guide: "airbnb" # стиль кода
    testing: "jest" # фреймворк для тестов
    comments: true # включать ли комментарии
```

#### 3. Рабочие процессы

```yaml
workflow:
    auto_save: true # автоматическое сохранение
    create_tests: true # автоматическое создание тестов
    add_documentation: true # добавление документации
    suggest_improvements: true # предложения улучшений
```

## Примеры пользовательских инструкций

### Для React разработчика

```yaml
# React Developer Instructions
code_preferences:
    language: "typescript"
    framework: "react"
    style_guide: "airbnb"
    testing: "jest"
    state_management: "redux"

workflow:
    create_tests: true
    add_documentation: true
    suggest_improvements: true
    use_hooks: true
    functional_components: true

communication_style:
    tone: "professional"
    detail_level: "detailed"
    examples: true
```

### Для Backend разработчика

```yaml
# Backend Developer Instructions
code_preferences:
    language: "python"
    framework: "fastapi"
    database: "postgresql"
    testing: "pytest"
    documentation: "openapi"

workflow:
    create_tests: true
    add_documentation: true
    suggest_improvements: true
    error_handling: true
    logging: true

communication_style:
    tone: "professional"
    detail_level: "detailed"
    examples: true
```

### Для DevOps инженера

```yaml
# DevOps Engineer Instructions
code_preferences:
    language: "yaml"
    infrastructure: "kubernetes"
    ci_cd: "github_actions"
    monitoring: "prometheus"
    logging: "elk"

workflow:
    create_tests: true
    add_documentation: true
    suggest_improvements: true
    security_scanning: true
    performance_optimization: true

communication_style:
    tone: "professional"
    detail_level: "detailed"
    examples: true
```

## Специфичные настройки

### Языки программирования

#### TypeScript

```yaml
typescript_preferences:
    strict_mode: true
    interfaces: true
    generics: true
    async_await: true
    error_handling: "try_catch"
```

#### Python

```yaml
python_preferences:
    version: "3.11"
    type_hints: true
    async_await: true
    error_handling: "try_except"
    documentation: "docstring"
```

#### JavaScript

```yaml
javascript_preferences:
    version: "es2022"
    modules: "es6"
    async_await: true
    error_handling: "try_catch"
    linting: "eslint"
```

### Фреймворки

#### React

```yaml
react_preferences:
    version: "18"
    hooks: true
    functional_components: true
    state_management: "context"
    styling: "css_modules"
    testing: "react_testing_library"
```

#### Node.js

```yaml
nodejs_preferences:
    version: "18"
    framework: "express"
    middleware: true
    error_handling: true
    logging: "winston"
    testing: "jest"
```

### Стили кода

#### Airbnb

```yaml
airbnb_style:
    indentation: 2
    quotes: "single"
    semicolons: true
    trailing_commas: true
    max_line_length: 80
```

#### Google

```yaml
google_style:
    indentation: 2
    quotes: "double"
    semicolons: true
    trailing_commas: false
    max_line_length: 100
```

## Управление инструкциями

### Экспорт и импорт

1. **Экспорт**
    - Откройте настройки
    - Нажмите "Export Instructions"
    - Сохраните JSON файл

2. **Импорт**
    - В настройках нажмите "Import Instructions"
    - Выберите JSON файл
    - Настройки будут применены

### Резервное копирование

Рекомендуется регулярно создавать резервные копии настроек:

```bash
# Создание резервной копии
cp ~/.researcherry/instructions.json ~/.researcherry/instructions.backup.json

# Восстановление из резервной копии
cp ~/.researcherry/instructions.backup.json ~/.researcherry/instructions.json
```

## Советы по настройке

### 1. Начните с основ

Не пытайтесь настроить всё сразу. Начните с:

- Предпочитаемого языка программирования
- Стиля общения
- Основных рабочих процессов

### 2. Итеративно улучшайте

По мере использования Researcherry:

- Отмечайте, что работает хорошо
- Определяйте, что можно улучшить
- Обновляйте настройки постепенно

### 3. Тестируйте настройки

После изменения настроек:

- Попробуйте несколько типичных задач
- Убедитесь, что результаты соответствуют ожиданиям
- При необходимости корректируйте

### 4. Делитесь с командой

Создавайте общие настройки для команды:

- Единый стиль кода
- Общие рабочие процессы
- Стандарты документации

## Устранение неполадок

### Настройки не применяются

1. Перезапустите VS Code/Cursor
2. Проверьте синтаксис JSON
3. Убедитесь, что файл сохранен

### Конфликты настроек

1. Проверьте приоритеты настроек
2. Убедитесь, что нет противоречий
3. Используйте более специфичные настройки

### Производительность

1. Упростите сложные настройки
2. Удалите неиспользуемые параметры
3. Оптимизируйте регулярные выражения

## Следующие шаги

Теперь, когда вы знакомы с пользовательскими инструкциями, изучите:

- [Локальные модели](./local-models.md)
- [Автоматическое одобрение действий](./auto-approving-actions.md)
- [MCP (Model Context Protocol)](./mcp.md)
