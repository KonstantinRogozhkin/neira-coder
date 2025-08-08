#!/bin/bash

# Останавливать выполнение при любой ошибке
set -e

# Функция валидации иконок после применения патчей
validate_icons_after_patch() {
    echo "      🔍 Валидация иконок..."
    local validation_failed=false
    
    # Проверяем основные иконки расширения
    local icon_files=(
        "src/assets/icons/icon.png"
        "src/assets/icons/icon-nightly.png" 
        "src/assets/icons/icon.svg"
        "src/assets/icons/icon-nightly.svg"
    )
    
    for icon_file in "${icon_files[@]}"; do
        if [ -f "$icon_file" ]; then
            # Проверяем размер файла (новые иконки должны быть меньше старых)
            file_size=$(stat -f%z "$icon_file" 2>/dev/null || stat -c%s "$icon_file" 2>/dev/null || echo 0)
            
            if [[ "$icon_file" == *.png ]]; then
                # PNG иконки: новые должны быть 3-4KB (не 18KB как старые)
                if [ "$file_size" -gt 10000 ]; then
                    echo "      ❌ $icon_file слишком большой ($file_size bytes) - возможно старая иконка!"
                    validation_failed=true
                else
                    echo "      ✅ $icon_file размер OK ($file_size bytes)"
                fi
            elif [[ "$icon_file" == *.svg ]]; then
                # SVG иконки: проверяем наличие градиента (признак новой иконки)
                if grep -q "linearGradient\|researcherryGradient" "$icon_file"; then
                    echo "      ✅ $icon_file содержит новый градиентный дизайн"
                else
                    echo "      ❌ $icon_file не содержит новый дизайн - возможно старая иконка!"
                    validation_failed=true
                fi
            fi
        else
            echo "      ❌ $icon_file не найден!"
            validation_failed=true
        fi
    done
    
    if [ "$validation_failed" = true ]; then
        echo "      🚨 ВАЛИДАЦИЯ ИКОНОК ПРОВАЛЕНА!"
        echo "      💡 Рекомендация: скопируйте правильные иконки из src/assets/icons/ вручную"
        return 1
    else
        echo "      ✅ Все иконки прошли валидацию"
        return 0
    fi
}

# --- КОНФИГУРАЦИЯ ---
UPSTREAM_REPO="https://github.com/RooCodeInc/Roo-Code.git"
# Ветка по умолчанию. Можно перекрыть через переменную окружения UPSTREAM_REF
UPSTREAM_BRANCH="main"
# Опциональный коммит/тег для воспроизводимой сборки. Можно задать через UPSTREAM_REF
# Пример: export UPSTREAM_REF="1a2b3c4d" или "v3.31.0". Если не задан, используется $UPSTREAM_BRANCH
UPSTREAM_REF="${UPSTREAM_REF:-$UPSTREAM_BRANCH}"
BUILD_DIR="build-src"
PATCHES_DIR="patches"

echo "=== Подготовка к сборке Researcherry ==="

# 1. Очистка
echo "-> Очистка предыдущей сборочной директории..."
rm -rf $BUILD_DIR

# 2. Клонирование чистого upstream
echo "-> Клонирование оригинального репозитория roo-code ($UPSTREAM_REF)..."
git clone --depth 1 --branch "$UPSTREAM_BRANCH" "$UPSTREAM_REPO" "$BUILD_DIR"
if [ "$UPSTREAM_REF" != "$UPSTREAM_BRANCH" ]; then
    echo "-> Переключение на $UPSTREAM_REF"
    (cd "$BUILD_DIR" && git fetch --depth 1 origin "$UPSTREAM_REF" && git checkout --detach "$UPSTREAM_REF") || {
        echo "⚠️ Не удалось переключиться на $UPSTREAM_REF, оставляем $UPSTREAM_BRANCH"
    }
fi

# 3. Применение патчей
echo "-> Наложение патчей..."
cd $BUILD_DIR

# Проверяем, есть ли патчи для применения
if [ -d "../$PATCHES_DIR" ] && [ "$(ls -A ../$PATCHES_DIR/*.patch 2>/dev/null)" ]; then
    echo "   Найдены патчи для применения:"
    
    # Применяем патчи в правильном порядке
    patch_order=(
        "001-branding.patch"
        "002-documentation.patch"
        "003-configuration.patch"
        "004-rules-modes.patch"
        "005-source-code.patch"
        "006-tests.patch"
    )
    
    # Добавляем общий патч только если он не слишком большой (< 100MB)
    if [ -f "../$PATCHES_DIR/007-general.patch" ]; then
        general_size=$(stat -f%z "../$PATCHES_DIR/007-general.patch" 2>/dev/null || stat -c%s "../$PATCHES_DIR/007-general.patch" 2>/dev/null || echo 0)
        if [ "$general_size" -lt 104857600 ]; then  # 100MB в байтах
            patch_order+=("007-general.patch")
        else
            echo "   ⚠️ 007-general.patch слишком большой ($(echo "scale=1; $general_size/1048576" | bc 2>/dev/null || echo "?")MB), пропускаем"
        fi
    fi
    
    # Добавляем патчи исправлений
    fix_patches=(
        "008-framer-motion-fix.patch"
        "009-workspace-fixes.patch"
        "013-updated-icon-fixes.patch"
        "012-new-logos-and-panels.patch"
    )
    
    # Критические патчи, которые должны применяться без ошибок
    critical_patches=(
        "001-branding.patch"
        "013-updated-icon-fixes.patch" 
        "012-new-logos-and-panels.patch"
    )
    
    for fix_patch in "${fix_patches[@]}"; do
        if [ -f "../$PATCHES_DIR/$fix_patch" ]; then
            patch_order+=("$fix_patch")
        fi
    done
    
    for patch_file in "${patch_order[@]}"; do
        if [ -f "../$PATCHES_DIR/$patch_file" ]; then
            echo "   -> Применение $patch_file"
            if git apply --ignore-whitespace --reject "../$PATCHES_DIR/$patch_file"; then
                echo "      ✅ $patch_file применен успешно"
            else
                echo "      ⚠️ $patch_file применен с предупреждениями (возможны .rej файлы)"
                
                # Проверяем критические патчи
                if [[ " ${critical_patches[*]} " =~ " ${patch_file} " ]]; then
                    echo "      🔥 КРИТИЧЕСКИЙ ПАТЧ: $patch_file не применился полностью!"
                    echo "      📋 Проверьте .rej файлы и исправьте конфликты вручную"
                    
                    # Проверяем иконки для критических патчей с иконками
                    if [[ "$patch_file" == *"icon"* ]]; then
                        echo "      🎯 Проверяем иконки после применения патча..."
                        validate_icons_after_patch
                    fi
                fi
            fi
        else
            echo "   -> ⚠️ Патч $patch_file не найден, пропускаем"
        fi
    done
else
    echo "   ⚠️ Патчи не найдены в директории $PATCHES_DIR"
fi

# 4. Установка зависимостей
echo "-> Установка зависимостей..."
if command -v pnpm &> /dev/null; then
    pnpm install || echo "⚠️ Ошибка при установке зависимостей с pnpm"
elif command -v npm &> /dev/null; then
    npm install || echo "⚠️ Ошибка при установке зависимостей с npm"
else
    echo "⚠️ Менеджер пакетов не найден (pnpm или npm)"
fi

# 5. Сборка проекта
echo "-> Сборка проекта..."
if command -v pnpm &> /dev/null; then
    pnpm run build || echo "⚠️ Ошибка при сборке с pnpm"
elif command -v npm &> /dev/null; then
    npm run build || echo "⚠️ Ошибка при сборке с npm"
fi

echo ""
echo "✅ Сборка завершена!"
echo "📁 Результат находится в директории: $BUILD_DIR"
echo ""
echo "Для тестирования расширения:"
echo "1. Откройте VS Code"
echo "2. Перейдите в папку $BUILD_DIR"
echo "3. Нажмите F5 для запуска в режиме разработки"