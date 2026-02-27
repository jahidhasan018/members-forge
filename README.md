# MembersForge

MembersForge is a WordPress membership plugin with a modular PHP backend and a React-powered wp-admin experience. It is designed to provide an enterprise-ready foundation for memberships, plans, and analytics workflows.

## Features

- **Modular plugin bootstrap** with a `ModuleManager` that registers and boots isolated modules (admin UI and API router).  
- **Admin dashboard app** mounted in wp-admin (`MembersForge` top-level menu) and built with `@wordpress/scripts` + React components.  
- **REST API namespace** at `members-forge/v1` with initial routes for:
  - `GET /stats` (dashboard summary data with transient cache)
  - `GET /levels` (membership level listing)
- **Database migration on activation** that provisions dedicated membership tables:
  - `wp_members_forge_levels`
  - `wp_members_forge_levelmeta`
- **Repository layer** (`LevelRepository`) to keep DB logic separate from controllers.
- **Unit tests** for core PHP classes and JS components.

## Tech Stack

- **Backend:** PHP 7.4+, WordPress plugin APIs, PSR-4 autoloading (Composer)
- **Frontend:** React via `@wordpress/element`, `@wordpress/components`, Tailwind CSS
- **Tooling:** `@wordpress/scripts`, Webpack override, Jest, PHPUnit, PHPCS, PHPStan
- **Local runtime:** Docker Compose (WordPress + MySQL + phpMyAdmin)

## Project Structure

```text
members-forge/
├── members-forge.php          # Plugin bootstrap/entry point
├── src/
│   ├── Plugin.php             # Plugin composition + activation hooks
│   ├── Core/                  # ModuleManager
│   ├── Modules/Admin/         # wp-admin menu + asset enqueue
│   ├── API/                   # Router + controllers
│   ├── Repositories/          # DB access layer
│   └── Database/              # DB migrations
├── assets/src/                # React application source
├── assets/build/              # Built JS/CSS artifacts
├── tests/                     # PHPUnit tests
├── docker-compose.yml         # Local WordPress stack
├── composer.json
└── package.json
```

## Setup Development Environment

### Prerequisites

- Docker + Docker Compose
- PHP 7.4+ and Composer 2+
- Node.js 18+ and npm

### 1) Install dependencies

```bash
composer install
npm install
```

### 2) Start local WordPress stack

Create a `.env` file in the repository root (used by Docker Compose):

```env
DB_NAME=wordpress
DB_USER=wordpress
DB_PASSWORD=wordpress
DB_ROOT_PASSWORD=root
```

Then run:

```bash
docker compose up -d
```

Services:
- WordPress: http://localhost:8080
- phpMyAdmin: http://localhost:8081

### 3) Build plugin assets

Development/watch mode:

```bash
npm run start
```

Production build:

```bash
npm run build
```

### 4) Activate the plugin

In WP Admin → **Plugins**, activate **MembersForge**.

On activation, DB migrations run automatically and register plugin tables.

## Development Process

Recommended day-to-day workflow:

1. **Create a branch** for your feature/fix.
2. **Implement backend changes** in `src/` using module + repository patterns.
3. **Implement UI changes** in `assets/src/` and keep components focused.
4. **Run test suites and static checks** before opening a PR.
5. **Build assets** (`npm run build`) for production-ready output if needed.
6. **Open PR** with clear summary, testing notes, and migration/API impacts.

### Coding conventions

- Keep WordPress hooks inside modules/controllers, not in global scope (except plugin bootstrap).
- Prefer dependency injection (as used in `Plugin` and `ApiRouter`).
- Keep database access in repositories.
- Add or update tests for any non-trivial logic change.

## Testing & Quality Checks

### PHP

```bash
./vendor/bin/phpunit
./vendor/bin/phpstan analyse src --level=5
./vendor/bin/phpcs
```

### JavaScript

```bash
npm test
npm run build
```

## API Reference (Current)

Base namespace: `/wp-json/members-forge/v1`

- `GET /stats`
  - Capability: `manage_options`
  - Returns dashboard metrics payload (transient-cached)

- `GET /levels`
  - Capability: `manage_options`
  - Returns membership levels from `members_forge_levels`

## Contribution Guide

1. Fork the repository.
2. Create your branch: `git checkout -b feature/short-description`
3. Commit with clear messages and focused diffs.
4. Ensure tests/checks pass locally.
5. Open a Pull Request with:
   - Problem statement
   - Solution summary
   - Screenshots (for UI changes)
   - Test evidence (commands + output)

### PR checklist

- [ ] Code follows existing architecture patterns.
- [ ] New/changed behavior is covered by tests.
- [ ] Backward compatibility considered (routes/schema/settings).
- [ ] Build/test commands run successfully.
- [ ] Any migration or manual QA steps documented.

## Suggested Next README Additions (as project grows)

- **Versioning & release process** (tagging, changelog workflow)
- **Security policy** (reporting vulnerabilities)
- **Roadmap** for upcoming modules (Members, Settings, Form Builder, AI)
- **Configuration reference** (constants, feature flags, env vars)
- **License details** (full GPL text link)

## License

GPL-2.0-or-later
