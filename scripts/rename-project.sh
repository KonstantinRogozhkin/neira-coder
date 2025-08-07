#!/bin/bash

# Скрипт для переименования проекта roo-code → neira-coder
# Использование: ./scripts/rename-project.sh [--dry-run] [--backup]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Переменные
OLD_NAME="roo-code"
NEW_NAME="neira-coder"
OLD_ORG="roo-code"
NEW_ORG="neira-coder"
OLD_DOMAIN="roocode.com"
NEW_DOMAIN="neira-coder.com"
OLD_EMAIL="roocode.com"
NEW_EMAIL="neira-coder.com"

DRY_RUN=false
CREATE_BACKUP=false

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

# Парсинг аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --backup)
            CREATE_BACKUP=true
            shift
            ;;
        *)
            log_error "Неизвестный аргумент: $1"
            exit 1
            ;;
    esac
done

# Проверка, что мы в корневой директории проекта
if [[ ! -f "package.json" ]] || [[ ! -f "pnpm-workspace.yaml" ]]; then
    log_error "Скрипт должен быть запущен из корневой директории проекта"
    exit 1
fi

log_info "Начинаем переименование проекта $OLD_NAME → $NEW_NAME"
if [[ "$DRY_RUN" == "true" ]]; then
    log_warning "Режим DRY RUN - изменения не будут применены"
fi

# Создание резервной копии
if [[ "$CREATE_BACKUP" == "true" ]]; then
    log_info "Создание резервной копии..."
    BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
    if [[ "$DRY_RUN" == "false" ]]; then
        git checkout -b "backup/$OLD_NAME-original"
        cp -r . "../$BACKUP_DIR"
        log_success "Резервная копия создана: ../$BACKUP_DIR"
    else
        log_info "DRY RUN: Создана бы резервная копия: ../$BACKUP_DIR"
    fi
fi

# Функция для замены в файлах
replace_in_files() {
    local pattern="$1"
    local replacement="$2"
    local file_pattern="$3"
    
    log_info "Замена '$pattern' → '$replacement' в файлах $file_pattern"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        find . -name "$file_pattern" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.turbo/*" -exec grep -l "$pattern" {} \; | head -10
        log_info "DRY RUN: Найдено $(find . -name "$file_pattern" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.turbo/*" -exec grep -l "$pattern" {} \; | wc -l) файлов для замены"
    else
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            find . -name "$file_pattern" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.turbo/*" -exec sed -i '' "s/$pattern/$replacement/g" {} \;
        else
            # Linux
            find . -name "$file_pattern" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.turbo/*" -exec sed -i "s/$pattern/$replacement/g" {} \;
        fi
        log_success "Замена завершена"
    fi
}

# Функция для переименования директорий
rename_directory() {
    local old_path="$1"
    local new_path="$2"
    
    if [[ -d "$old_path" ]]; then
        log_info "Переименование директории: $old_path → $new_path"
        if [[ "$DRY_RUN" == "false" ]]; then
            mv "$old_path" "$new_path"
            log_success "Директория переименована"
        else
            log_info "DRY RUN: Директория была бы переименована"
        fi
    else
        log_warning "Директория $old_path не найдена"
    fi
}

# Шаг 1: Замена в package.json файлах
log_info "=== Шаг 1: Обновление package.json файлов ==="

# Корневой package.json
if [[ "$DRY_RUN" == "false" ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"name\": \"$OLD_NAME\"/\"name\": \"$NEW_NAME\"/g" package.json
    else
        sed -i "s/\"name\": \"$OLD_NAME\"/\"name\": \"$NEW_NAME\"/g" package.json
    fi
fi

# Замена имен пакетов в package.json
replace_in_files "@$OLD_ORG/" "@$NEW_ORG/" "package.json"

# Шаг 2: Замена импортов в коде
log_info "=== Шаг 2: Обновление импортов в коде ==="

# TypeScript/JavaScript файлы
replace_in_files "from \"@$OLD_ORG/" "from \"@$NEW_ORG/" "*.ts"
replace_in_files "from \"@$OLD_ORG/" "from \"@$NEW_ORG/" "*.tsx"
replace_in_files "from \"@$OLD_ORG/" "from \"@$NEW_ORG/" "*.js"
replace_in_files "from \"@$OLD_ORG/" "from \"@$NEW_ORG/" "*.jsx"

# Шаг 3: Обновление конфигурационных файлов
log_info "=== Шаг 3: Обновление конфигурационных файлов ==="

# tsconfig.json
replace_in_files "\"extends\": \"@$OLD_ORG/" "\"extends\": \"@$NEW_ORG/" "tsconfig.json"

# turbo.json
replace_in_files "@$OLD_ORG/" "@$NEW_ORG/" "turbo.json"

# Шаг 4: Переименование директорий
log_info "=== Шаг 4: Переименование директорий ==="

# Переименование web-roo-code → web-neira-coder
rename_directory "apps/web-roo-code" "apps/web-neira-coder"

# Шаг 5: Обновление URL и доменов
log_info "=== Шаг 5: Обновление URL и доменов ==="

# Замена доменов
replace_in_files "$OLD_DOMAIN" "$NEW_DOMAIN" "*.ts"
replace_in_files "$OLD_DOMAIN" "$NEW_DOMAIN" "*.tsx"
replace_in_files "$OLD_DOMAIN" "$NEW_DOMAIN" "*.js"
replace_in_files "$OLD_DOMAIN" "$NEW_DOMAIN" "*.json"
replace_in_files "$OLD_DOMAIN" "$NEW_DOMAIN" "*.md"

# Замена GitHub URLs
replace_in_files "github.com/RooCodeInc/Roo-Code" "github.com/NeiraCoderInc/Neira-Coder" "*.ts"
replace_in_files "github.com/RooCodeInc/Roo-Code" "github.com/NeiraCoderInc/Neira-Coder" "*.tsx"
replace_in_files "github.com/RooCodeInc/Roo-Code" "github.com/NeiraCoderInc/Neira-Coder" "*.js"
replace_in_files "github.com/RooCodeInc/Roo-Code" "github.com/NeiraCoderInc/Neira-Coder" "*.json"
replace_in_files "github.com/RooCodeInc/Roo-Code" "github.com/NeiraCoderInc/Neira-Coder" "*.md"

# Замена email адресов
replace_in_files "@$OLD_EMAIL" "@$NEW_EMAIL" "*.ts"
replace_in_files "@$OLD_EMAIL" "@$NEW_EMAIL" "*.tsx"
replace_in_files "@$OLD_EMAIL" "@$NEW_EMAIL" "*.js"
replace_in_files "@$OLD_EMAIL" "@$NEW_EMAIL" "*.json"
replace_in_files "@$OLD_EMAIL" "@$NEW_EMAIL" "*.md"

# Шаг 6: Обновление локализации
log_info "=== Шаг 6: Обновление локализации ==="

# Обновление файлов локализации
replace_in_files "roo-code-settings.json" "neira-coder-settings.json" "*.json"
replace_in_files "RooCode" "NeiraCoder" "*.json"

# Шаг 7: Очистка и переустановка зависимостей
if [[ "$DRY_RUN" == "false" ]]; then
    log_info "=== Шаг 7: Очистка и переустановка зависимостей ==="
    
    log_info "Удаление node_modules и pnpm-lock.yaml..."
    rm -rf node_modules
    rm -f pnpm-lock.yaml
    
    log_info "Установка зависимостей..."
    pnpm install
    
    log_success "Зависимости переустановлены"
else
    log_info "DRY RUN: Зависимости не переустанавливались"
fi

# Финальная проверка
log_info "=== Финальная проверка ==="

if [[ "$DRY_RUN" == "false" ]]; then
    log_info "Проверка сборки..."
    if pnpm build > /dev/null 2>&1; then
        log_success "Сборка прошла успешно"
    else
        log_error "Ошибка при сборке"
        exit 1
    fi
    
    log_info "Проверка типов..."
    if pnpm check-types > /dev/null 2>&1; then
        log_success "Проверка типов прошла успешно"
    else
        log_warning "Есть ошибки типов - проверьте вручную"
    fi
else
    log_info "DRY RUN: Проверки не выполнялись"
fi

log_success "Переименование проекта завершено!"
log_info "Следующие шаги:"
log_info "1. Проверьте все изменения: git diff"
log_info "2. Запустите тесты: pnpm test"
log_info "3. Проверьте линтер: pnpm lint"
log_info "4. Протестируйте приложения: pnpm dev"
log_info "5. Создайте коммит с изменениями"

if [[ "$DRY_RUN" == "true" ]]; then
    log_warning "Это был DRY RUN. Для применения изменений запустите скрипт без --dry-run"
fi 