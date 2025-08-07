# Автоматическое одобрение действий

Автоматическое одобрение действий позволяет Neira Coder выполнять определенные операции без вашего подтверждения, ускоряя рабочий процесс.

## Что такое автоматическое одобрение?

Автоматическое одобрение - это настройка, которая позволяет Neira Coder:

- Выполнять безопасные действия без подтверждения
- Ускорить рабочий процесс
- Уменьшить количество прерываний
- Автоматизировать рутинные задачи

## Настройка автоматического одобрения

### Открытие настроек

1. Откройте Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Введите "Neira Coder: Open Settings"
3. Перейдите в раздел "Auto-Approval"

### Типы действий

#### Безопасные действия (автоодобрение по умолчанию)

- Чтение файлов
- Создание новых файлов
- Выполнение безопасных команд терминала
- Открытие веб-страниц

#### Действия, требующие подтверждения

- Удаление файлов
- Изменение системных настроек
- Выполнение потенциально опасных команд
- Установка пакетов

#### Настраиваемые действия

- Создание определенных типов файлов
- Выполнение специфичных команд
- Работа с определенными папками

## Настройка правил

### Глобальные правила

```yaml
auto_approval:
    enabled: true
    safe_actions: true
    file_operations:
        read: true
        create: true
        edit: false
        delete: false
    terminal_commands:
        safe: true
        dangerous: false
    browser_actions:
        open: true
        search: true
```

### Правила для файлов

```yaml
file_rules:
    - pattern: "*.md"
      actions: ["read", "create", "edit"]
    - pattern: "*.js"
      actions: ["read", "create"]
    - pattern: "package.json"
      actions: ["read"]
    - pattern: "node_modules/**"
      actions: []
```

### Правила для команд

```yaml
command_rules:
    - pattern: "npm install"
      auto_approve: true
    - pattern: "git status"
      auto_approve: true
    - pattern: "rm -rf"
      auto_approve: false
    - pattern: "sudo"
      auto_approve: false
```

## Примеры конфигураций

### Для разработчика

```yaml
# Разработчик - больше автоодобрения
auto_approval:
    enabled: true
    file_operations:
        read: true
        create: true
        edit: true
        delete: false
    terminal_commands:
        safe: true
        package_managers: true
        git: true
        build: true
    exclusions:
        - "node_modules/**"
        - ".git/**"
        - "*.log"
```

### Для консервативного пользователя

```yaml
# Консервативный - минимум автоодобрения
auto_approval:
    enabled: true
    file_operations:
        read: true
        create: false
        edit: false
        delete: false
    terminal_commands:
        safe: true
        package_managers: false
        git: false
        build: false
```

### Для опытного пользователя

```yaml
# Опытный - полное автоодобрение
auto_approval:
    enabled: true
    file_operations:
        read: true
        create: true
        edit: true
        delete: true
    terminal_commands:
        safe: true
        package_managers: true
        git: true
        build: true
        system: false
```

## Управление исключениями

### Исключения по папкам

```yaml
exclusions:
    folders:
        - "node_modules"
        - ".git"
        - "dist"
        - "build"
        - ".env"
```

### Исключения по файлам

```yaml
exclusions:
    files:
        - "package-lock.json"
        - "yarn.lock"
        - "*.log"
        - ".env*"
```

### Исключения по командам

```yaml
exclusions:
    commands:
        - "rm -rf"
        - "sudo"
        - "chmod 777"
        - "format"
```

## Мониторинг и логирование

### Включение логов

```yaml
logging:
    enabled: true
    level: "info"
    auto_approved_actions: true
    file: "~/.neira/auto-approval.log"
```

### Просмотр логов

```bash
# Просмотр последних действий
tail -f ~/.neira/auto-approval.log

# Поиск конкретных действий
grep "file_created" ~/.neira/auto-approval.log
```

## Безопасность

### Рекомендации по безопасности

1. **Начните с консервативных настроек**
2. **Постепенно расширяйте автоодобрение**
3. **Регулярно проверяйте логи**
4. **Исключайте критичные папки и файлы**
5. **Не разрешайте системные команды**

### Проверка безопасности

```bash
# Проверка настроек
neira-coder check-security

# Аудит действий
neira-coder audit-actions
```

## Устранение неполадок

### Действие не выполняется автоматически

1. Проверьте настройки автоодобрения
2. Убедитесь, что действие не в исключениях
3. Проверьте логи для диагностики

### Слишком много подтверждений

1. Расширьте правила автоодобрения
2. Добавьте часто используемые действия
3. Настройте исключения

### Проблемы с безопасностью

1. Проверьте логи на подозрительные действия
2. Ужесточите правила автоодобрения
3. Добавьте больше исключений

## Советы по использованию

### 1. Постепенная настройка

- Начните с чтения файлов
- Добавьте создание файлов
- Расширьте на команды терминала

### 2. Регулярный аудит

- Проверяйте логи еженедельно
- Анализируйте автоматические действия
- Корректируйте настройки при необходимости

### 3. Командная работа

- Создавайте общие настройки для команды
- Документируйте правила автоодобрения
- Регулярно обновляйте политики

### 4. Резервное копирование

```bash
# Создание резервной копии настроек
cp ~/.neira/auto-approval.json ~/.neira/auto-approval.backup.json

# Восстановление настроек
cp ~/.neira/auto-approval.backup.json ~/.neira/auto-approval.json
```

## Следующие шаги

Теперь, когда вы знакомы с автоматическим одобрением действий, изучите:

- [MCP (Model Context Protocol)](./mcp.md)
- [FAQ](../faq.md)
