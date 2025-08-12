# Патчи для исправления проблем сборки Researcherry

Этот документ описывает дополнительные патчи, созданные для исправления проблем сборки после применения основных патчей переименования.

## 🔧 Патчи для исправления сборки

### 008-framer-motion-fix.patch (3.2K)

**Исправляет проблемы TypeScript с framer-motion в web-roo-code**

**Проблема:**

- Ошибки типов в компонентах React с framer-motion
- Отсутствие типизации для variants объектов
- Использование устаревших массивов ease

**Исправления:**

- ✅ Добавлен импорт `type Variants` из framer-motion
- ✅ Добавлена типизация ко всем variants: `containerVariants: Variants`, `itemVariants: Variants`, `backgroundVariants: Variants`
- ✅ Заменены массивы ease `[0.21, 0.45, 0.27, 0.9]` на строки `"easeOut"`

**Файлы:**

- `apps/web-roo-code/src/components/homepage/features.tsx`
- `apps/web-roo-code/src/components/homepage/install-section.tsx`
- `apps/web-roo-code/src/components/homepage/testimonials.tsx`

### 009-workspace-fixes.patch (7.2K)

**Исправляет несоответствия имен пакетов workspace**

**Проблема:**

- Ссылки на старые имена пакетов `@roo-code/*` в package.json
- Неправильные пути в TypeScript конфигурациях
- Отсутствующий файл Config.ts в cloud пакете

**Исправления:**

- ✅ `@roo-code/config-eslint` → `@researcherry/config-eslint`
- ✅ `@roo-code/config-typescript` → `@researcherry/config-typescript`
- ✅ `@roo-code/types` → `@researcherry/types`
- ✅ `@roo-code/evals` → `@researcherry/evals`
- ✅ `@roo-code/build` → `@researcherry/build`
- ✅ `@roo-code/vscode-webview` → `@researcherry/vscode-webview`
- ✅ Восстановлен файл `Config.ts` с правильными экспортами

**Файлы:**

- `apps/vscode-e2e/package.json`
- `apps/vscode-nightly/package.json`
- `apps/web-evals/package.json`
- `apps/web-evals/tsconfig.json`
- `apps/web-roo-code/package.json`
- `apps/web-roo-code/tsconfig.json`
- `packages/cloud/src/Config.ts`

### 010-icon-fixes.patch (2.2MB)

**Исправляет иконки VSCode расширения на правильный брендинг Researcherry**

**Проблема:**

- PNG иконки содержали старый дизайн с кенгуру от "Researcherry"
- Неправильный брендинг в расширении VSCode
- Размер файлов был слишком большой (859KB вместо 18KB)

**Исправления:**

- ✅ Заменены PNG иконки на правильный дизайн Researcherry
- ✅ Конвертированы из ICNS в PNG 128x128px (требование VSCode)
- ✅ Обновлены основная и nightly версии
- ✅ Создана резервная копия старых иконок
- ✅ Уменьшен размер файлов с 859KB до 18KB

**Файлы:**

- `src/assets/icons/icon.png` - основная иконка расширения
- `src/assets/icons/icon-nightly.png` - иконка nightly версии

## 🚀 Порядок применения патчей

### Для полной сборки проекта:

1. Применить основные патчи переименования (001-007)
2. **Применить патчи исправлений:**
    ```bash
    cd build-src
    git apply ../patches/008-framer-motion-fix.patch
    git apply ../patches/009-workspace-fixes.patch
    git apply ../patches/010-icon-fixes.patch
    git apply ../patches/011-improved-svg-icons.patch
    git apply ../patches/012-new-logos-and-panels.patch
    ```
3. Запустить сборку:
    ```bash
    pnpm install
    pnpm build
    ```

### Результат после применения патчей:

- ✅ Все компоненты собираются успешно
- ✅ Исправлены ошибки TypeScript с framer-motion
- ✅ Работают все workspace зависимости
- ✅ Webview собирается без ошибок
- ✅ Web приложения (web-roo-code, web-researcherry, web-evals) работают корректно

## 📊 Статистика исправлений

**Всего исправлено проблем:** 25+

- 3 файла с framer-motion типами
- 7 файлов с workspace зависимостями
- 1 восстановленный Config.ts файл
- 4 исправленные иконки VSCode расширения (PNG + SVG)
- 4 новых логотипа Researcherry
- 2 обновленные панели с оптимизацией размера
- 185+ удаленных .rej файлов
- Множество исправлений в импортах и типах

**Время сборки после исправлений:** ~19 секунд
**Размер итогового VSIX:** ~28 MB

## ⚠️ Важные замечания

1. **Патчи 008-012 критически важны** для успешной сборки проекта
2. Применяйте их **после** основных патчей переименования
3. Без этих патчей проект **не соберется** из-за ошибок TypeScript и отсутствующих зависимостей
4. **Патчи 010-012** полностью обновляют брендинг и иконки на Researcherry
5. **Патч 011** создает современные SVG иконки с улучшенным дизайном
6. **Патч 012** добавляет полный набор логотипов и оптимизирует панели
7. Патчи созданы на основе успешно протестированных исправлений
