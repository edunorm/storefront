# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

This is a **Turborepo monorepo** for the **Edunorm Storefront** (`cursusboeken.nl`), built with modern web technologies designed to run on Cloudflare's edge infrastructure.

### Key Technologies
- **Turborepo** - Monorepo build system with caching and task orchestration
- **SvelteKit 5** - Frontend framework with server-side rendering
- **Tailwind CSS 4** - Utility-first CSS framework
- **Cloudflare Workers** - Serverless runtime environment
- **Hono** - Fast web framework for Cloudflare Workers
- **WooCommerce REST API** - E-commerce backend integration
- **pnpm** - Package manager with workspace support
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript

## Project Structure

### Applications (`apps/`)
- **`cursusboeken`** - Main SvelteKit storefront application
- **`woo-api`** - Hono-based API worker for WooCommerce integration

### Packages (`packages/`)
- **`ui`** - Shared Svelte component library 
- **`woocommerce-client`** - Fetch-based WooCommerce REST API client for Cloudflare Workers
- **`eslint-config`** - Shared ESLint configuration
- **`typescript-config`** - Shared TypeScript configurations

## Architecture

### Monorepo Structure
The repository uses Turborepo's task dependency graph to orchestrate builds across packages. Each package has its own `package.json` with scripts that can depend on other packages being built first (using `^build` notation in `turbo.json`).

### Deployment Architecture
- **Frontend**: SvelteKit app deployed to Cloudflare Pages using `@sveltejs/adapter-cloudflare`
- **API**: Hono worker deployed to Cloudflare Workers for WooCommerce API proxy
- **Internationalization**: Uses Paraglide for i18n support (nl, en, de locales)
- **Styling**: Tailwind CSS 4 with forms and typography plugins

### WooCommerce Integration
The `woo-api` worker acts as a secure proxy between the frontend and WooCommerce REST API, handling authentication and providing type-safe endpoints. The custom `WooFetchClient` is designed specifically for Cloudflare Workers compatibility.

## Common Development Commands

### Setup and Installation
```bash
pnpm install              # Install all dependencies
```

### Development
```bash
pnpm dev                  # Start all apps in development mode
turbo dev --filter=cursusboeken  # Start only the main storefront app
turbo dev --filter=woo-api       # Start only the API worker
```

### Building
```bash
pnpm build                # Build all packages and apps
turbo build --filter=cursusboeken  # Build only storefront
turbo build --filter=woo-api       # Build only API worker
```

### Testing
```bash
turbo test:unit --filter=cursusboeken    # Run unit tests (Vitest)
turbo test:e2e --filter=cursusboeken     # Run E2E tests (Playwright)
```

### Code Quality
```bash
pnpm lint                 # Lint all packages
pnpm format               # Format code with Prettier
turbo check-types         # Type check all TypeScript
```

### Working with Individual Packages
```bash
# Navigate to specific app/package
cd apps/cursusboeken
pnpm dev                  # Run local dev server

cd apps/woo-api  
pnpm dev                  # Run Wrangler dev server
pnpm deploy               # Deploy to Cloudflare Workers

# UI package development
cd packages/ui
pnpm dev                  # Component library dev mode
```

### Cloudflare Deployment
```bash
# Generate Cloudflare Worker types
cd apps/cursusboeken && pnpm cf-typegen
cd apps/woo-api && pnpm cf-typegen

# Deploy individual workers
cd apps/cursusboeken && pnpm deploy
cd apps/woo-api && pnpm deploy
```

## Development Workflow

### Adding New Dependencies
- Use `pnpm add <package>` in the specific app/package directory
- For shared dependencies, add to workspace packages and reference as `workspace:*`
- Shared configs are in `packages/eslint-config` and `packages/typescript-config`

### Creating Components
- Add new Svelte components to `packages/ui/src/lib/`
- Export from `packages/ui/src/lib/index.ts`
- Components automatically available in apps that import the UI package

### WooCommerce API Integration
- Add new endpoints to `apps/woo-api/src/index.ts` 
- Use the `WooFetchClient` from `@edunorm/woocommerce-client`
- Environment variables: `WOO_URL`, `WOO_CONSUMER_KEY`, `WOO_CONSUMER_SECRET`

### Internationalization
- Messages are managed via Paraglide
- See `apps/cursusboeken/src/routes/demo/paraglide/+page.svelte` for usage examples
- Supports Dutch (nl), English (en), and German (de)

## Key Files and Configurations

### Build Configuration
- `turbo.json` - Defines task dependencies and caching strategies
- `pnpm-workspace.yaml` - Defines workspace structure
- Each app has its own `vite.config.ts` and `svelte.config.js`

### Deployment Configuration  
- `apps/*/wrangler.jsonc` - Cloudflare Workers configuration
- Uses `@sveltejs/adapter-cloudflare` for SvelteKit deployment

### Type Safety
- Cloudflare Worker types auto-generated via `wrangler types`
- Shared TypeScript configs in `packages/typescript-config/`
- WooCommerce types imported from `@woocommerce/woocommerce-rest-api`

### Testing Setup
- **Unit Tests**: Vitest with `vitest-browser-svelte` for component testing
- **E2E Tests**: Playwright for browser automation
- **Type Checking**: `svelte-check` for Svelte-specific type validation

## Package Manager

This project uses **pnpm** with workspaces. Always use `pnpm` instead of `npm` or `yarn` to maintain consistency with the lockfile and workspace configuration.
