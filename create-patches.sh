#!/usr/bin/env bash

set -euo pipefail

#
# Researcherry: lightweight patch generator
#
# Generates trimmed patch files in the patches/ directory by comparing
# the clean upstream (build-src) with the current repository, excluding
# heavy and generated artifacts to keep patches small (<100MB).
#

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PATCHES_DIR="$ROOT_DIR/patches"
BUILD_DIR="$ROOT_DIR/build-src"

# Upstream settings (can be overridden via env)
UPSTREAM_REPO="${UPSTREAM_REPO:-https://github.com/RooCodeInc/Roo-Code.git}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
UPSTREAM_REF="${UPSTREAM_REF:-$UPSTREAM_BRANCH}"

mkdir -p "$PATCHES_DIR"

echo "=== Creating patches (trimmed) ==="

# 1) Ensure baseline repo exists
if [ ! -d "$BUILD_DIR/.git" ]; then
  echo "-> Cloning upstream baseline into $BUILD_DIR (ref: $UPSTREAM_REF)"
  git clone --depth 1 --branch "$UPSTREAM_BRANCH" "$UPSTREAM_REPO" "$BUILD_DIR"
  if [ "$UPSTREAM_REF" != "$UPSTREAM_BRANCH" ]; then
    (cd "$BUILD_DIR" && git fetch --depth 1 origin "$UPSTREAM_REF" && git checkout --detach "$UPSTREAM_REF") || true
  fi
fi

# 2) Common exclude patterns (heavy / generated / cache)
read -r -d '' EXCLUDES <<'EOF' || true
--exclude .git/
--exclude node_modules/
--exclude .turbo/
--exclude .vite-port
--exclude dist/
--exclude build/
--exclude bin/
--exclude webview-ui/build/
--exclude webview-ui/node_modules/
--exclude packages/**/node_modules/
--exclude packages/**/npm/dist/
--exclude scripts/**/tmp/**
--exclude **/*.map
--exclude **/*.log
EOF

tmpdir="$(mktemp -d)"
cleanup() { rm -rf "$tmpdir"; }
trap cleanup EXIT

BASE_DIR="$tmpdir/base"
CURR_DIR="$tmpdir/curr"
mkdir -p "$BASE_DIR" "$CURR_DIR"

echo "-> Preparing filtered snapshots for diff..."

# 3) Copy filtered snapshots (use rsync include lists per category if needed)
rsync -a --delete $EXCLUDES "$BUILD_DIR/" "$BASE_DIR/"
rsync -a --delete $EXCLUDES "$ROOT_DIR/" "$CURR_DIR/"

# 4) Helper to write patch if non-empty
write_patch() {
  local name="$1"; shift
  local include_paths=("$@")
  local patch_path="$PATCHES_DIR/$name"

  # Build path filters for diff
  local filters=( )
  if [ ${#include_paths[@]} -gt 0 ]; then
    for p in "${include_paths[@]}"; do
      filters+=("--" "$p")
    done
  fi

  echo "   - Generating $name"
  if git -c core.quotepath=false diff --no-index --binary --src-prefix=a/ --dst-prefix=b/ "$BASE_DIR" "$CURR_DIR" "${filters[@]}" > "$patch_path"; then
    if [ -s "$patch_path" ]; then
      echo "     ✅ $name created ($(du -h "$patch_path" | awk '{print $1}'))"
    else
      rm -f "$patch_path"
      echo "     ⚠️  $name empty, skipped"
    fi
  else
    echo "     ⚠️  git diff returned non-zero for $name (might be ok)"
  fi
}

# 5) Generate categorized patches (order matches build.sh expectations)

# Branding (icons, names)
write_patch "001-branding.patch" \
  "src/assets/icons" \
  "src/assets/icons/**" \
  "webview-ui/public" \
  "webview-ui/public/**" \
  "src/package.json"

# Documentation
write_patch "002-documentation.patch" \
  "README.md" "CHANGELOG.md" "LICENSE" \
  "locales" "locales/**" \
  ".docs" ".docs/**"

# Configuration
write_patch "003-configuration.patch" \
  "package.json" ".github" ".github/**" \
  "src/package.json" "webview-ui/package.json" \
  "apps/**/package.json" "packages/**/package.json" \
  "scripts" "scripts/**"

# Rules / modes (keep flexible)
write_patch "004-rules-modes.patch" \
  ".clinerules" ".clinerules/**" \
  ".neira" ".neira/**"

# Source code (main)
write_patch "005-source-code.patch" \
  "src" "src/**" \
  "webview-ui/src" "webview-ui/src/**" \
  "packages" "packages/**"

# Tests
write_patch "006-tests.patch" \
  "src/**/__tests__/**" \
  "webview-ui/src/**/__tests__/**" \
  "packages/**/__tests__/**"

# General (everything else minor, but still filtered by EXCLUDES)
write_patch "007-general.patch"

echo "=== Done. Patches are in $PATCHES_DIR ==="

#!/bin/bash

# Скрипт для создания отдельных патчей по категориям (только русский и английский языки)

set -e

PATCHES_DIR="patches"
MAIN_BRANCH="main"
DEV_BRANCH="researcherry"

echo "=== Создание патчей Researcherry (только ru/en локализация) ==="

# Очищаем старые патчи
echo "-> Очистка старых патчей..."
rm -rf $PATCHES_DIR/*.patch 2>/dev/null || true

# Создаем директорию если её нет
mkdir -p $PATCHES_DIR

echo "-> Создание патчей по категориям..."

# 1. Патч для переименования и брендинга (только русский и английский, без .docs)
echo "   - Создание патча для брендинга..."
git diff $MAIN_BRANCH..$DEV_BRANCH -- \
    "README.md" \
    "CHANGELOG.md" \
    "CONTRIBUTING.md" \
    "package.json" \
    "src/package.json" \
    "webview-ui/package.json" \
    "apps/web-researcherry/**" \
    "src/assets/icons/**" \
    "webview-ui/public/**" \
    "src/i18n/locales/en/**" \
    "src/i18n/locales/ru/**" \
    "webview-ui/src/i18n/locales/en/**" \
    "webview-ui/src/i18n/locales/ru/**" \
    "src/package.nls.json" \
    "src/package.nls.ru.json" \
    > $PATCHES_DIR/001-branding.patch 2>/dev/null || echo "      (пустой патч)"

# 2. Патч для документации (только русский и английский)
echo "   - Создание патча для документации..."
git diff $MAIN_BRANCH..$DEV_BRANCH -- \
    "locales/en/**" \
    "locales/ru/**" \
    "CONTRIBUTING.md" \
    "CODE_OF_CONDUCT.md" \
    ".docs/**" \
    > $PATCHES_DIR/002-documentation.patch 2>/dev/null || echo "      (пустой патч)"

# 3. Патч для конфигурации (исключая локализации)
echo "   - Создание патча для конфигурации..."
git diff $MAIN_BRANCH..$DEV_BRANCH -- \
    ".vscode/**" \
    "package*.json" \
    "tsconfig*.json" \
    "*.yaml" \
    "*.yml" \
    "*.config.*" \
    "eslint.config.*" \
    "turbo.json" \
    ".changeset/**" \
    > $PATCHES_DIR/003-configuration.patch 2>/dev/null || echo "      (пустой патч)"

# 4. Патч для правил и режимов (исключая экспорты кода)
echo "   - Создание патча для правил и режимов..."
git diff $MAIN_BRANCH..$DEV_BRANCH -- \
    ".clinerules/**" \
    ".researcherry/plan.md" \
    ".researcherrymodes" \
    "scripts/**" \
    ".github/**" \
    ".roo/**" \
    > $PATCHES_DIR/004-rules-modes.patch 2>/dev/null || echo "      (пустой патч)"

# 5. Патч для исходного кода (только ru/en локализации)
echo "   - Создание патча для исходного кода (только ru/en)..."
git diff $MAIN_BRANCH..$DEV_BRANCH -- \
    "src/**" \
    "webview-ui/src/**" \
    "packages/**" \
    ":(exclude)src/i18n/locales/ca" \
    ":(exclude)src/i18n/locales/de" \
    ":(exclude)src/i18n/locales/es" \
    ":(exclude)src/i18n/locales/fr" \
    ":(exclude)src/i18n/locales/hi" \
    ":(exclude)src/i18n/locales/id" \
    ":(exclude)src/i18n/locales/it" \
    ":(exclude)src/i18n/locales/ja" \
    ":(exclude)src/i18n/locales/ko" \
    ":(exclude)src/i18n/locales/nl" \
    ":(exclude)src/i18n/locales/pl" \
    ":(exclude)src/i18n/locales/pt-BR" \
    ":(exclude)src/i18n/locales/tr" \
    ":(exclude)src/i18n/locales/vi" \
    ":(exclude)src/i18n/locales/zh-CN" \
    ":(exclude)src/i18n/locales/zh-TW" \
    ":(exclude)webview-ui/src/i18n/locales/ca" \
    ":(exclude)webview-ui/src/i18n/locales/de" \
    ":(exclude)webview-ui/src/i18n/locales/es" \
    ":(exclude)webview-ui/src/i18n/locales/fr" \
    ":(exclude)webview-ui/src/i18n/locales/hi" \
    ":(exclude)webview-ui/src/i18n/locales/id" \
    ":(exclude)webview-ui/src/i18n/locales/it" \
    ":(exclude)webview-ui/src/i18n/locales/ja" \
    ":(exclude)webview-ui/src/i18n/locales/ko" \
    ":(exclude)webview-ui/src/i18n/locales/nl" \
    ":(exclude)webview-ui/src/i18n/locales/pl" \
    ":(exclude)webview-ui/src/i18n/locales/pt-BR" \
    ":(exclude)webview-ui/src/i18n/locales/tr" \
    ":(exclude)webview-ui/src/i18n/locales/vi" \
    ":(exclude)webview-ui/src/i18n/locales/zh-CN" \
    ":(exclude)webview-ui/src/i18n/locales/zh-TW" \
    ":(exclude)src/package.nls.ca.json" \
    ":(exclude)src/package.nls.de.json" \
    ":(exclude)src/package.nls.es.json" \
    ":(exclude)src/package.nls.fr.json" \
    ":(exclude)src/package.nls.hi.json" \
    ":(exclude)src/package.nls.id.json" \
    ":(exclude)src/package.nls.it.json" \
    ":(exclude)src/package.nls.ja.json" \
    ":(exclude)src/package.nls.ko.json" \
    ":(exclude)src/package.nls.nl.json" \
    ":(exclude)src/package.nls.pl.json" \
    ":(exclude)src/package.nls.pt-BR.json" \
    ":(exclude)src/package.nls.tr.json" \
    ":(exclude)src/package.nls.vi.json" \
    ":(exclude)src/package.nls.zh-CN.json" \
    ":(exclude)src/package.nls.zh-TW.json" \
    > $PATCHES_DIR/005-source-code.patch 2>/dev/null || echo "      (пустой патч)"

# 6. Патч для тестов
echo "   - Создание патча для тестов..."
git diff $MAIN_BRANCH..$DEV_BRANCH -- \
    "**/*test*" \
    "**/*spec*" \
    "**/__tests__/**" \
    > $PATCHES_DIR/006-tests.patch 2>/dev/null || echo "      (пустой патч)"

# 7. Общий патч для всего остального (исключая уже обработанные файлы)
echo "   - Создание общего патча (только ru/en, без экспортов, документации, правил)..."
git diff $MAIN_BRANCH..$DEV_BRANCH \
    ":(exclude).researcherry/export_code" \
    ":(exclude).docs" \
    ":(exclude).github" \
    ":(exclude).clinerules" \
    ":(exclude).roo" \
    ":(exclude)apps" \
    ":(exclude)src" \
    ":(exclude)webview-ui" \
    ":(exclude)packages" \
    ":(exclude)scripts" \
    ":(exclude)locales" \
    ":(exclude)patches" \
    > /tmp/full-general.patch 2>/dev/null || touch /tmp/full-general.patch

if [ -s /tmp/full-general.patch ]; then
    # Исключаем все уже обработанные файлы и ненужные вещи
    grep -v -E "(src|webview-ui)/src/i18n/locales/(ca|de|es|fr|hi|id|it|ja|ko|nl|pl|pt-BR|tr|vi|zh-CN|zh-TW)/" /tmp/full-general.patch | \
    grep -v -E "src/package\.nls\.(ca|de|es|fr|hi|id|it|ja|ko|nl|pl|pt-BR|tr|vi|zh-CN|zh-TW)\.json" | \
    grep -v -E "locales/(ca|de|es|fr|hi|id|it|ja|ko|nl|pl|pt-BR|tr|vi|zh-CN|zh-TW)/" | \
    grep -v -E "\\.researcherry/export_code/" | \
    grep -v -E "\.docs/" | \
    grep -v -E "\.github/" | \
    grep -v -E "\.clinerules/" | \
    grep -v -E "\.roo/" | \
    grep -v -E "README\.md|CHANGELOG\.md|CONTRIBUTING\.md|CODE_OF_CONDUCT\.md" | \
    grep -v -E "apps/" | \
    grep -v -E "src/" | \
    grep -v -E "webview-ui/" | \
    grep -v -E "packages/" | \
    grep -v -E "\.researcherrymodes" | \
    grep -v -E "scripts/" | \
    grep -v -E "pnpm-lock\.yaml|package-lock\.json|yarn\.lock" | \
    grep -v -E "\\.(png|jpg|jpeg|gif|ico|ttf|woff|woff2|bin|exe)$" | \
    grep -v -E "test|spec" \
    > $PATCHES_DIR/007-general.patch || cp /tmp/full-general.patch $PATCHES_DIR/007-general.patch
else
    echo "      (пустой патч)"
    touch $PATCHES_DIR/007-general.patch
fi
rm -f /tmp/full-general.patch

echo ""
echo "✅ Патчи созданы (только ru/en, без экспортов кода):"
ls -lh $PATCHES_DIR/*.patch 2>/dev/null || echo "Нет файлов патчей"

echo ""
echo "📊 Статистика изменений:"
echo "Всего коммитов в ветке: $(git rev-list --count $MAIN_BRANCH..$DEV_BRANCH)"
echo "Измененных файлов: $(git diff --name-only $MAIN_BRANCH..$DEV_BRANCH | wc -l)"
echo "Добавленных строк: $(git diff --stat $MAIN_BRANCH..$DEV_BRANCH | tail -1 | grep -o '[0-9]\+ insertion' | grep -o '[0-9]\+' || echo '0')"
echo "Удаленных строк: $(git diff --stat $MAIN_BRANCH..$DEV_BRANCH | tail -1 | grep -o '[0-9]\+ deletion' | grep -o '[0-9]\+' || echo '0')"
echo ""
echo "🌐 Включены только локализации: English (en), Русский (ru)"
echo "📦 Исключены экспорты кода (.researcherry/export_code/) для экономии места"
echo ""
echo "⚠️  ВНИМАНИЕ: 007-general.patch очень большой ($(ls -lh $PATCHES_DIR/007-general.patch | awk '{print $5}'))"
echo "   Рекомендуется использовать только специфические патчи для сборки."