#!/bin/bash

# Скрипт для отката переименования проекта neira-coder → roo-code
# Использование: ./scripts/rollback-rename.sh [--backup-dir=path]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Переменные
OLD_NAME="neira-coder"
NEW_NAME="roo-code"
OLD_ORG="neira-coder"
NEW_ORG="roo-code"
OLD_DOMAIN="neira-coder.com"
NEW_DOMAIN="roocode.com"
OLD_EMAIL="neira-coder.com"
NEW_EMAIL="roocode.com"

BACKUP_DIR=""

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
        --backup-dir=*)
            BACKUP_DIR="${1#*=}"
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

log_info "Начинаем откат переименования проекта $OLD_NAME → $NEW_NAME"

# Проверка наличия резервной копии
if [[ -z "$BACKUP_DIR" ]]; then
    # Поиск последней резервной копии
    BACKUP_DIR=$(find .. -maxdepth 1 -name "backup-*" -type d | sort | tail -1)
    if [[ -z "$BACKUP_DIR" ]]; then
        log_error "Резервная копия не найдена. Укажите путь к резервной копии: --backup-dir=path"
        exit 1
    fi
    log_info "Найдена резервная копия: $BACKUP_DIR"
fi

if [[ ! -d "$BACKUP_DIR" ]]; then
    log_error "Директория резервной копии не существует: $BACKUP_DIR"
    exit 1
fi

# Подтверждение отката
log_warning "ВНИМАНИЕ: Это действие откатит все изменения переименования!"
log_warning "Резервная копия: $BACKUP_DIR"
echo
read -p "Вы уверены, что хотите продолжить? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Откат отменен"
    exit 0
fi

# Создание резервной копии текущего состояния
CURRENT_BACKUP="backup-current-$(date +%Y%m%d-%H%M%S)"
log_info "Создание резервной копии текущего состояния: $CURRENT_BACKUP"
cp -r . "../$CURRENT_BACKUP"
log_success "Текущее состояние сохранено в: ../$CURRENT_BACKUP"

# Очистка текущей директории (кроме .git)
log_info "Очистка текущей директории..."
find . -mindepth 1 -not -path "./.git" -not -path "./.git/*" -delete

# Восстановление из резервной копии
log_info "Восстановление из резервной копии..."
cp -r "$BACKUP_DIR"/* .
cp -r "$BACKUP_DIR"/.* . 2>/dev/null || true

# Восстановление .git директории
if [[ -d "$CURRENT_BACKUP/.git" ]]; then
    log_info "Восстановление .git директории..."
    rm -rf .git
    cp -r "$CURRENT_BACKUP/.git" .
fi

log_success "Восстановление завершено"

# Проверка восстановления
log_info "=== Проверка восстановления ==="

# Проверка основных файлов
if [[ -f "package.json" ]]; then
    if grep -q "\"name\": \"$NEW_NAME\"" package.json; then
        log_success "✅ Корневой package.json восстановлен"
    else
        log_error "❌ Ошибка в корневом package.json"
    fi
else
    log_error "❌ package.json не найден"
fi

# Проверка директорий
if [[ -d "apps/web-roo-code" ]]; then
    log_success "✅ Директория apps/web-roo-code восстановлена"
else
    log_error "❌ Директория apps/web-roo-code не найдена"
fi

# Проверка workspace пакетов
packages=("types" "cloud" "ipc" "telemetry" "evals" "build" "config-eslint" "config-typescript")
for pkg in "${packages[@]}"; do
    if [[ -d "packages/$pkg" ]]; then
        log_success "✅ Пакет packages/$pkg восстановлен"
    else
        log_error "❌ Пакет packages/$pkg не найден"
    fi
done

# Переустановка зависимостей
log_info "Переустановка зависимостей..."
rm -rf node_modules
rm -f pnpm-lock.yaml
pnpm install

# Проверка сборки
log_info "Проверка сборки..."
if pnpm build > /dev/null 2>&1; then
    log_success "✅ Сборка прошла успешно"
else
    log_warning "⚠️  Есть проблемы со сборкой"
fi

# Проверка типов
log_info "Проверка типов..."
if pnpm check-types > /dev/null 2>&1; then
    log_success "✅ Проверка типов прошла успешно"
else
    log_warning "⚠️  Есть ошибки типов"
fi

log_success "Откат переименования завершен!"
log_info "Проект восстановлен из резервной копии: $BACKUP_DIR"
log_info "Текущее состояние сохранено в: ../$CURRENT_BACKUP"
log_info ""
log_info "Следующие шаги:"
log_info "1. Проверьте все изменения: git status"
log_info "2. Запустите тесты: pnpm test"
log_info "3. Проверьте линтер: pnpm lint"
log_info "4. Протестируйте приложения: pnpm dev" 