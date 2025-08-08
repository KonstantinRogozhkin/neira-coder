#!/bin/bash

# Скрипт для проверки результатов переименования проекта
# Использование: ./scripts/verify-rename.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Переменные
OLD_NAME="roo-code"
NEW_NAME="researcherry"
OLD_ORG="roo-code"
NEW_ORG="researcherry"

# Функции
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка, что мы в корневой директории проекта
if [[ ! -f "package.json" ]] || [[ ! -f "pnpm-workspace.yaml" ]]; then
    log_error "Скрипт должен быть запущен из корневой директории проекта"
    exit 1
fi

log_info "Проверка результатов переименования проекта..."

# Функция для подсчета вхождений
count_occurrences() {
    local pattern="$1"
    local file_pattern="$2"
    local count=$(find . -name "$file_pattern" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.turbo/*" -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l)
    echo $count
}

# Функция для проверки файла
check_file() {
    local file="$1"
    local pattern="$2"
    local description="$3"
    
    if [[ -f "$file" ]]; then
        if grep -q "$pattern" "$file" 2>/dev/null; then
            log_error "❌ $description: найдено в $file"
            return 1
        else
            log_success "✅ $description: OK в $file"
            return 0
        fi
    else
        log_warning "⚠️  Файл $file не найден"
        return 0
    fi
}

# Функция для проверки директории
check_directory() {
    local dir="$1"
    local description="$2"
    
    if [[ -d "$dir" ]]; then
        log_success "✅ $description: директория $dir существует"
        return 0
    else
        log_error "❌ $description: директория $dir не найдена"
        return 1
    fi
}

# Счетчики
old_occurrences=0
new_occurrences=0
errors=0

log_info "=== Проверка основных файлов ==="

# Проверка корневого package.json
check_file "package.json" "\"name\": \"$OLD_NAME\"" "Старое имя проекта" || ((errors++))
check_file "package.json" "\"name\": \"$NEW_NAME\"" "Новое имя проекта" || ((errors++))

# Проверка workspace пакетов
packages=("types" "cloud" "ipc" "telemetry" "evals" "build" "config-eslint" "config-typescript")
for pkg in "${packages[@]}"; do
    check_file "packages/$pkg/package.json" "\"name\": \"@$OLD_ORG/$pkg\"" "Старое имя пакета @$OLD_ORG/$pkg" || ((errors++))
    check_file "packages/$pkg/package.json" "\"name\": \"@$NEW_ORG/$pkg\"" "Новое имя пакета @$NEW_ORG/$pkg" || ((errors++))
done

# Проверка приложений
check_file "apps/web-researcherry/package.json" "\"name\": \"@$NEW_ORG/web-researcherry\"" "Новое имя приложения web-researcherry" || ((errors++))
check_file "apps/web-evals/package.json" "\"name\": \"@$NEW_ORG/web-evals\"" "Новое имя приложения web-evals" || ((errors++))
check_file "webview-ui/package.json" "\"name\": \"@$NEW_ORG/vscode-webview\"" "Новое имя пакета vscode-webview" || ((errors++))

log_info "=== Проверка директорий ==="

# Проверка переименованных директорий
check_directory "apps/web-researcherry" "Переименованное приложение" || ((errors++))
check_directory "apps/web-roo-code" "Старое приложение (должно быть удалено)" && ((errors++))

log_info "=== Проверка конфигурационных файлов ==="

# Проверка tsconfig.json файлов
check_file "packages/types/tsconfig.json" "\"extends\": \"@$OLD_ORG/" "Старые extends в types/tsconfig.json" || ((errors++))
check_file "packages/types/tsconfig.json" "\"extends\": \"@$NEW_ORG/" "Новые extends в types/tsconfig.json" || ((errors++))

# Проверка turbo.json
check_file "turbo.json" "@$OLD_ORG/" "Старые зависимости в turbo.json" || ((errors++))
check_file "turbo.json" "@$NEW_ORG/" "Новые зависимости в turbo.json" || ((errors++))

log_info "=== Проверка импортов в коде ==="

# Подсчет оставшихся старых импортов
old_imports=$(count_occurrences "from \"@$OLD_ORG/" "*.ts")
old_imports_tsx=$(count_occurrences "from \"@$OLD_ORG/" "*.tsx")
old_imports_js=$(count_occurrences "from \"@$OLD_ORG/" "*.js")
old_imports_jsx=$(count_occurrences "from \"@$OLD_ORG/" "*.jsx")
total_old_imports=$((old_imports + old_imports_tsx + old_imports_js + old_imports_jsx))

# Подсчет новых импортов
new_imports=$(count_occurrences "from \"@$NEW_ORG/" "*.ts")
new_imports_tsx=$(count_occurrences "from \"@$NEW_ORG/" "*.tsx")
new_imports_js=$(count_occurrences "from \"@$NEW_ORG/" "*.js")
new_imports_jsx=$(count_occurrences "from \"@$NEW_ORG/" "*.jsx")
total_new_imports=$((new_imports + new_imports_tsx + new_imports_js + new_imports_jsx))

if [[ $total_old_imports -gt 0 ]]; then
    log_error "❌ Найдено $total_old_imports файлов со старыми импортами @$OLD_ORG/"
    ((errors++))
else
    log_success "✅ Все старые импорты @$OLD_ORG/ заменены"
fi

if [[ $total_new_imports -gt 0 ]]; then
    log_success "✅ Найдено $total_new_imports файлов с новыми импортами @$NEW_ORG/"
else
    log_warning "⚠️  Не найдено новых импортов @$NEW_ORG/"
fi

log_info "=== Проверка сборки ==="

# Проверка, что проект собирается
if pnpm build > /dev/null 2>&1; then
    log_success "✅ Сборка проекта прошла успешно"
else
    log_error "❌ Ошибка при сборке проекта"
    ((errors++))
fi

log_info "=== Проверка типов ==="

# Проверка типов TypeScript
if pnpm check-types > /dev/null 2>&1; then
    log_success "✅ Проверка типов прошла успешно"
else
    log_warning "⚠️  Есть ошибки типов - проверьте вручную"
fi

log_info "=== Проверка тестов ==="

# Проверка тестов
if pnpm test > /dev/null 2>&1; then
    log_success "✅ Тесты прошли успешно"
else
    log_warning "⚠️  Есть ошибки в тестах - проверьте вручную"
fi

log_info "=== Проверка линтера ==="

# Проверка линтера
if pnpm lint > /dev/null 2>&1; then
    log_success "✅ Линтер прошел успешно"
else
    log_warning "⚠️  Есть ошибки линтера - проверьте вручную"
fi

log_info "=== Финальный отчет ==="

if [[ $errors -eq 0 ]]; then
    log_success "🎉 Все проверки прошли успешно! Переименование завершено корректно."
    exit 0
else
    log_error "❌ Найдено $errors ошибок. Проверьте их вручную."
    log_info "Рекомендации:"
    log_info "1. Проверьте все файлы с ошибками"
    log_info "2. Запустите скрипт переименования еще раз"
    log_info "3. Проверьте вручную все импорты и зависимости"
    exit 1
fi 