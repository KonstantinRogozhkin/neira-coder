# Инвентарь иконок и логотипов Researcherry

Этот документ содержит полный список всех иконок, логотипов и графических ресурсов в проекте Researcherry.

## 🎨 Основные иконки VSCode расширения

### `src/assets/icons/`

- **`icon.png`** (3.6KB) - Основная иконка расширения 128x128px (PNG из SVG)
- **`icon.svg`** (1.4KB) - Улучшенная SVG версия с градиентом и тенями
- **`icon-nightly.png`** (3.9KB) - Иконка для nightly версии 128x128px (PNG из SVG)
- **`icon-nightly.svg`** (1.6KB) - SVG версия nightly с индикатором
- **`panel_dark.png`** (348B) - Белый N на прозрачном фоне для темной темы
- **`panel_light.png`** (325B) - Черный N на прозрачном фоне для светлой темы

### Новые логотипы Researcherry:

- **`logo_researcherry_black_char.svg`** (1.1KB) - Символ N черный на прозрачном фоне
- **`logo_researcherry_white_char.svg`** (1.1KB) - Символ N белый на прозрачном фоне
- **`logo_researcherry_black_full.svg`** (4.0KB) - Полный логотип "Researcherry" черный
- **`logo_researcherry_white_full.svg`** (4.0KB) - Полный логотип "Researcherry" белый (основной)

### Резервные копии:

- **`icon-old-backup.png`** (859KB) - Резервная копия старой иконки (кенгуру)
- **`panel_dark_backup.png`** (1.4KB) - Резервная копия старой темной панели
- **`panel_light_backup.png`** (1.2KB) - Резервная копия старой светлой панели

### Дизайн основной иконки:

- **Размер**: 128x128 пикселей (требование VSCode)
- **Формат**: PNG с RGBA каналами
- **Дизайн**: Синий градиент (#3B82F6 → #06B6D4) с белой буквой "N"
- **Источник**: Конвертирован из `webview-ui/public/researcherry-512.icns`

## 🌐 Веб-приложение иконки

### `apps/web-researcherry/public/`

- **`favicon.ico`** (15KB) - Основной favicon
- **`favicon-16x16.png`** (322B) - Favicon 16x16
- **`favicon-32x32.png`** (600B) - Favicon 32x32
- **`apple-touch-icon.png`** (4.0KB) - Иконка для iOS/macOS
- **`android-chrome-192x192.png`** (4.5KB) - Android иконка 192x192
- **`android-chrome-512x512.png`** (14KB) - Android иконка 512x512

## 🏷️ Логотипы и брендинг

### `apps/web-researcherry/public/`

- **`ResearcherryCoder-Logo-Horiz-blk.svg`** (232KB) - Горизонтальный логотип (черный)
- **`ResearcherryCoder-Logo-Horiz-white.svg`** (231KB) - Горизонтальный логотип (белый)
- **`RooCode-Badge-blk.svg`** (7.7KB) - Бейдж RooCode (черный) - УСТАРЕЛ
- **`RooCode-Badge-white.svg`** (481KB) - Бейдж RooCode (белый) - УСТАРЕЛ

### `webview-ui/public/`

- **`researcherry-512.icns`** (1.5MB) - Основная иконка macOS формата (источник истины)
- **`favicon.ico`** (15KB) - Favicon для webview

### `src/assets/images/`

- **`roo-logo.svg`** - Теперь содержит символ N Researcherry (заменен)
- **`roo-logo-backup.svg`** - Резервная копия старого логотипа RooCode - УСТАРЕЛ

## 🔧 Другие графические ресурсы

### `apps/web-researcherry/public/`

- **`placeholder.svg`** (3.3KB) - Заглушка изображения
- **`placeholder_pfp.png`** (64KB) - Заглушка профиля пользователя

### `src/assets/images/`

- **`openrouter.png`** - Логотип OpenRouter
- **`requesty.png`** - Логотип Requesty

## 📝 Патчи с иконками

### 001-branding.patch

Содержит обновления основных иконок при переименовании:

- `src/assets/icons/icon.png`
- `src/assets/icons/icon.svg`
- `apps/web-researcherry/public/favicon.ico`
- `apps/web-researcherry/public/apple-touch-icon.png`
- `webview-ui/public/favicon.ico`

### 010-icon-fixes.patch (2.2MB)

Исправляет иконки расширения VSCode:

- ✅ Заменяет старые PNG иконки с кенгуру на правильный дизайн Researcherry
- ✅ Конвертирует из ICNS в PNG 128x128px (требование VSCode)
- ✅ Обновляет основную и nightly версии
- ✅ Создает резервную копию старых иконок

### 011-improved-svg-icons.patch (3.0MB)

Улучшает SVG иконки и пересоздает PNG из них:

- ✅ Современный дизайн SVG с улучшенным градиентом
- ✅ Добавлена тень и блики для объема
- ✅ Увеличен viewBox до 512x512 для лучшей масштабируемости
- ✅ Добавлен индикатор nightly версии (золотая точка)
- ✅ PNG файлы пересозданы из SVG (3.6KB против 18KB из ICNS)
- ✅ Создание резервных копий PNG из ICNS

### 012-new-logos-and-panels.patch (23KB)

Добавляет новые логотипы Researcherry и обновляет панели:

- ✅ Добавлены новые логотипы Researcherry (символ N и полный логотип)
- ✅ Черные и белые версии логотипов на прозрачном фоне
- ✅ Заменен старый roo-logo.svg на новый символ N
- ✅ Обновлены panel_dark.png и panel_light.png с символом N
- ✅ Уменьшен размер панелей: 348B и 325B (против 1.4KB и 1.2KB)
- ✅ Созданы резервные копии старых панелей

## 🎯 Источник истины

**Основная иконка**: `webview-ui/public/researcherry-512.icns`

- Это файл содержит правильный дизайн Researcherry
- Все остальные иконки должны генерироваться из него
- Размер: 1.5MB, формат: macOS ICNS

## ⚠️ Устаревшие файлы

Следующие файлы содержат старый брендинг и должны быть обновлены:

- `src/assets/images/roo-logo.svg` - старый логотип RooCode
- `apps/web-researcherry/public/RooCode-Badge-*.svg` - старые бейджи RooCode
- `src/assets/icons/icon-old-backup.png` - резервная копия старой иконки

## 🔄 Процесс обновления иконок

Для создания новых иконок из основного ICNS файла:

```bash
# Создать PNG 128x128 для VSCode расширения
sips -s format png -z 128 128 webview-ui/public/researcherry-512.icns --out src/assets/icons/icon.png

# Создать PNG 16x16 для favicon
sips -s format png -z 16 16 webview-ui/public/researcherry-512.icns --out favicon-16x16.png

# Создать PNG 32x32 для favicon
sips -s format png -z 32 32 webview-ui/public/researcherry-512.icns --out favicon-32x32.png
```

## 📊 Статистика

- **Всего файлов иконок**: 20+
- **Основных форматов**: PNG, SVG, ICO, ICNS
- **Размеры**: от 16x16 до 1024x1024 пикселей
- **Общий размер**: ~3MB
- **Статус брендинга**: ✅ Обновлено на Researcherry (кроме устаревших файлов)
