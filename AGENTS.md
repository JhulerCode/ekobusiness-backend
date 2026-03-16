# AGENTS.md

Welcome to the **ekobusiness-backend** repository. These instructions are intended for AI coding agents to ensure consistency, maintainability, and efficiency.

## 1. Project Overview
- **Type**: Node.js backend application.
- **Architecture**: Express-based REST API, Sequelize ORM for database, modular structure with internal ESM imports.
- **Module System**: ESM (`"type": "module"` in `package.json`). Use `import`/`export`.

## 2. Build, Run, and Development Commands
- **Start Development Server**: `npm run dev` (Uses `--watch` to hot-reload)
- **Start Production Server**: `npm run start`
- **Connect DB Seeder**: `npm run conndb`

*Note: No automated test suite is currently configured. If adding tests, please follow standard practices (e.g., Jest or Mocha) and document them in this file.*

## 3. Code Style & Standards
- **Language**: JavaScript (ESM).
- **Formatting**: Adhere to `.prettierrc.json` settings.
- **Imports**: Utilize project path aliases defined in `package.json` for cleaner imports:
  - `#core/*` -> `./src/core/*`
  - `#ecommerce/*` -> `./src/ecommerce/*`
  - `#infrastructure/*` -> `./src/infrastructure/*`
  - `#db/*` -> `./src/infrastructure/db/*`
  - `#http/*` -> `./src/infrastructure/http/*`
  - `#shared/*` -> `./src/shared/*`
- **Naming Conventions**:
  - Files: `camelCase.js`
  - Classes/Models: `PascalCase`
  - Variables/Functions: `camelCase`
- **Error Handling**:
  - Always implement try-catch blocks for database and external network calls.
  - Consistent error responses with proper HTTP status codes.

## 4. Directory Structure
```text
src/
├── core/            # Business logic (per entity)
├── ecommerce/       # E-commerce specific logic
├── infrastructure/  # DB, HTTP, Mail, Clients
├── shared/          # Utility modules
└── store/           # State/Store logic
```

## 5. Agent Instructions
- **Consistency**: Mimic existing file patterns (controller `cEntity.js` + router `rEntity.js`).
- **Dependencies**: Do not introduce new dependencies without checking with the user.
- **Safety**: Never log sensitive data (passwords, tokens, credentials).
- **Documentation**: If you make significant structural changes, update this `AGENTS.md` file.

*This project does not currently have explicit Cursor or Copilot rule files. Follow these guidelines as the authoritative source.*
