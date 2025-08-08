# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Researcherry is an AI-powered autonomous coding agent that lives in a VS Code extension. It can communicate in natural language, read/write files, run terminal commands, automate browser actions, and integrate with various AI models via OpenAI-compatible APIs. The project supports multiple specialized modes, custom instructions, and MCP (Model Context Protocol) integration.

## Development Commands

### Core Commands

- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Run ESLint across all packages
- `pnpm check-types` - TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean build artifacts

### Extension Development

- Press `F5` in VS Code - Launch extension in debug mode with hot reload
- `pnpm install:vsix` - Build and install VSIX package locally
- `pnpm vsix` - Build VSIX package to `bin/` directory
- `pnpm bundle` - Bundle extension for production
- `pnpm watch:bundle` - Watch mode for extension bundling

### Testing

- Single package test: `cd packages/[package-name] && pnpm test`
- E2E tests: `cd apps/vscode-e2e && pnpm test`

## Architecture

### Monorepo Structure

- **`src/`** - Main VS Code extension source code
- **`webview-ui/`** - React-based webview UI components
- **`packages/`** - Shared packages (types, telemetry, cloud, etc.)
- **`apps/`** - Applications (e2e tests, evals, nightly builds)

### Key Components

#### Extension Core (`src/`)

- **`extension.ts`** - Main extension entry point
- **`core/`** - Core functionality (tasks, prompts, tools, context tracking)
- **`api/`** - AI provider implementations (Anthropic, OpenAI, etc.)
- **`integrations/`** - VS Code integrations (terminal, editor, diagnostics)
- **`services/`** - Background services (MCP, marketplace, code indexing)

#### WebView UI (`webview-ui/`)

- React-based chat interface using Vite
- Components organized by feature (chat, settings, history, marketplace)
- Uses Tailwind CSS and Radix UI components
- i18n support for multiple languages

#### Shared Packages (`packages/`)

- **`@researcherry/types`** - TypeScript type definitions
- **`@researcherry/cloud`** - Cloud service integration
- **`@researcherry/telemetry`** - Usage analytics
- **`@researcherry/ipc`** - Inter-process communication

### AI Provider System

The extension supports multiple AI providers through a pluggable architecture:

- Anthropic (Claude), OpenAI, Gemini, Ollama, LM Studio, and others
- Providers implement `ApiHandler` interface in `src/api/providers/`
- Request/response transformation in `src/api/transform/`
- Streaming and caching support

### Tool System

Tools allow the AI to interact with the development environment:

- File operations: `readFileTool`, `writeToFileTool`, `searchFilesTool`
- Terminal: `executeCommandTool`
- Browser: `browserActionTool`
- Code search: `codebaseSearchTool`, `listCodeDefinitionNamesTool`
- Task management: `newTaskTool`, `attemptCompletionTool`

### Mode System

Specialized AI personalities and capabilities:

- Built-in modes: Code, Architect, Ask, Debug
- Custom modes via YAML configuration
- Mode-specific prompts and tool access

## Important Files & Directories

### Configuration

- `src/package.json` - Extension manifest with VS Code contribution points
- `turbo.json` - Monorepo build configuration
- `pnpm-workspace.yaml` - Workspace package definitions

### Key Source Files

- `src/core/webview/ClineProvider.ts` - Main webview provider
- `src/core/task/Task.ts` - Core task execution logic
- `src/core/prompts/system.ts` - System prompt generation
- `src/api/providers/` - AI provider implementations
- `src/core/tools/` - Tool implementations

### Testing

- Test files use `.spec.ts` or `.test.ts` suffix
- `src/__tests__/` - Integration tests
- `webview-ui/src/__tests__/` - UI component tests
- `apps/vscode-e2e/` - End-to-end tests

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- ESLint configuration in `packages/config-eslint/`
- Prettier for formatting
- Follow existing patterns in the codebase

### Testing Strategy

- Unit tests for core logic
- Integration tests for API interactions
- E2E tests for user workflows
- Run tests before submitting changes

### Common Development Tasks

- Adding new AI provider: Implement in `src/api/providers/`
- Adding new tool: Implement in `src/core/tools/`
- UI changes: Work in `webview-ui/src/components/`
- Adding translations: Update files in `webview-ui/src/i18n/locales/`

### Build Process

The project uses Turbo for monorepo management with parallel builds. The extension is bundled using esbuild for the main process and Vite for the webview UI.

### Security Considerations

- Sensitive operations require user approval
- Command execution has configurable timeouts and allowlists
- File operations respect .rsignore patterns
- No credentials stored in code or committed to repository
