# Установка Researcherry Coder

## Требования

- Visual Studio Code или Cursor
- Node.js 18+ (для локальной разработки)
- Аккаунт у одного из поддерживаемых ИИ-провайдеров

## Способы установки

### 1. Установка из VS Code Marketplace (Рекомендуется)

1. Откройте VS Code или Cursor
2. Перейдите в раздел Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Найдите "Researcherry Coder" в поиске
4. Нажмите "Install"

### 2. Установка из VSIX файла

1. Скачайте последний VSIX файл с [GitHub Releases](https://github.com/ResearcherryCoderInc/researcherry/releases)
2. В VS Code перейдите в Extensions
3. Нажмите на три точки (...) и выберите "Install from VSIX..."
4. Выберите скачанный файл

### 3. Установка для разработчиков

Если вы хотите установить версию для разработки:

```bash
# Клонируйте репозиторий
git clone https://github.com/ResearcherryCoderInc/researcherry.git
cd researcherry

# Установите зависимости
pnpm install

# Соберите и установите расширение
pnpm install:vsix
```

## После установки

После успешной установки:

1. Перезапустите VS Code/Cursor
2. Откройте Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Введите "Researcherry Coder" - вы должны увидеть доступные команды
4. Перейдите к [подключению API провайдера](./connecting-api-provider.md)

## Устранение неполадок

### Расширение не появляется

- Убедитесь, что VS Code/Cursor перезапущен
- Проверьте, что расширение установлено в разделе Extensions
- Попробуйте отключить и включить расширение

### Ошибки при установке

- Убедитесь, что у вас есть права администратора
- Проверьте, что VS Code/Cursor обновлен до последней версии
- Попробуйте установить расширение вручную через VSIX

## Следующие шаги

После установки перейдите к [подключению API провайдера](./connecting-api-provider.md).
