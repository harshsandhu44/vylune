# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vylune is a Bun-powered monorepo for an inventory management system with multi-environment AWS deployment. The system uses a modern stack with Next.js, tRPC, DynamoDB, and AWS CDK.

## Common Commands

### Development

```bash
bun install                  # Install dependencies
bun run dev:web             # Start Next.js dev server on port 3000
bun run dev:api             # Start API in watch mode (local development)
bun run type-check          # Type check all workspaces
```

### Building

```bash
bun run build               # Build all workspaces (packages → apps → services)
bun run build:packages      # Build only packages
bun run build:apps          # Build only apps
bun run build:services      # Build only services
bun run build:infra         # Build only infrastructure
```

### Code Quality

```bash
bun run lint                # Run ESLint across all workspaces
bun run lint:fix            # Fix ESLint issues automatically
bun run format              # Format code with Prettier
bun run format:check        # Check formatting without modifying
```

### Infrastructure (AWS CDK)

```bash
# Development environment
bun run cdk:synth:dev       # Synthesize CloudFormation template
bun run cdk:diff:dev        # Show infrastructure changes
bun run cdk:deploy:dev      # Deploy to dev environment

# Staging environment
bun run cdk:synth:stg       # Synthesize for staging
bun run cdk:diff:stg        # Show staging changes
bun run cdk:deploy:stg      # Deploy to staging

# Production environment
bun run cdk:synth:prd       # Synthesize for production
bun run cdk:diff:prd        # Show production changes
bun run cdk:deploy:prd      # Deploy to production
```

## Architecture

### Monorepo Structure

- **apps/web**: Next.js 15 application (App Router) with shadcn/ui and Tailwind 4
- **packages/core**: Shared Zod schemas, TypeScript types, and tRPC utilities
- **services/api**: tRPC API with AWS Lambda handlers
- **infra/cdk**: AWS CDK infrastructure definitions

### Data Models

The system uses DynamoDB with a single-table design pattern via OneTable. Key entities:

- **Product**: Inventory items with SKU, price, quantity tracking
- **StockMovement**: Audit trail for inventory changes (IN/OUT/ADJUSTMENT)
- **User**: User accounts with Cognito integration and role-based access
- **Organization**: Multi-tenant organizations with leader/member roles
- **OrganizationMember**: Junction table for user-organization relationships

### Database Schema (`services/api/src/db/schema.ts`)

Single-table design with:

- **Primary Index**: pk (hash), sk (sort)
- **GSI1**: gs1pk (hash), gs1sk (sort) - used for list queries (all products, all users, etc.)
- **GSI2**: cognitoId (hash) - used for user lookups by Cognito ID

Access patterns:

- Products: `pk=PRODUCT#{id}`, list via `gs1pk=PRODUCTS`
- Users: `pk=USER#{id}`, list via `gs1pk=USERS`, lookup via `cognitoId`
- Organizations: `pk=ORGANIZATION#{id}`, members via `pk=ORGANIZATION#{id}&sk=USER#{userId}`
- Stock movements: `pk=PRODUCT#{productId}&sk=STOCK#{createdAt}#{id}`

### API Structure (`services/api`)

tRPC routers expose:

- **product**: CRUD operations for products
- **stock**: List and create stock movements (automatically updates product quantities)
- **user**: User management, organization membership

Lambda handler at `services/api/src/utils/lambda.ts` wraps tRPC for API Gateway.

### Frontend Structure (`apps/web`)

- **app/**: Next.js App Router pages (route groups: `(app)`, `(auth)`)
- **components/**: Reusable UI components (shadcn/ui based)
  - `ui/`: Base shadcn components
  - `app-sidebar/`: Application sidebar navigation
  - `app-header/`: Application header
  - `auth/`: Authentication components
  - `forms/`: Form components
  - `tables/`: Table components
- **lib/**: Utilities (tRPC client, utils)
- **hooks/**: Custom React hooks
- **stores/**: Zustand state management

### Environment Configuration

Three environments configured in `infra/cdk/config/environments.ts`:

1. **dev**: Development (eu-central-1)
   - Resources: VyluneTable-Dev, vylune-users-dev, vylune-api-dev
   - CORS: localhost:3000, localhost:3001
   - Removal policy: DESTROY

2. **stg**: Staging (eu-central-1)
   - Resources: VyluneTable-Stg, vylune-users-stg, vylune-api-stg
   - CORS: https://stg.vylune.com
   - Removal policy: RETAIN

3. **prd**: Production (eu-central-1)
   - Resources: VyluneTable-Prd, vylune-users-prd, vylune-api-prd
   - CORS: https://vylune.com, https://www.vylune.com
   - Removal policy: RETAIN

### AWS Infrastructure

Stack outputs (exported for each environment):

- UserPoolId: Cognito User Pool ID
- UserPoolClientId: Cognito User Pool Client ID
- TableName: DynamoDB Table Name
- ApiUrl: API Gateway URL
- Region: AWS Region (eu-central-1)

## Key Technologies

- **Runtime**: Bun (for package management and script execution)
- **Frontend**: Next.js 15 with App Router, React 19, shadcn/ui, Tailwind 4
- **Backend**: tRPC 11, AWS Lambda (Node.js 20.x)
- **Database**: DynamoDB with OneTable single-table design
- **Auth**: AWS Cognito with JWT authorization
- **Infrastructure**: AWS CDK (TypeScript)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **API Gateway**: AWS HTTP API with CORS configured per environment

## Important Patterns

### Workspace Dependencies

- Core package (`@vylune/core`) is referenced as `workspace:*` in all other packages
- API service types are imported in web app for tRPC type inference
- Build order matters: packages → apps → services

### Type Safety

- All schemas defined in `@vylune/core/schemas` using Zod
- tRPC provides end-to-end type safety from API to frontend
- TypeScript strict mode enabled across all workspaces
- Base tsconfig at root with strict settings (noUncheckedIndexedAccess, noUnusedLocals, etc.)

### Lambda Bundling

- API service bundles with Bun: `bun build src/utils/lambda.ts --target node --minify --format cjs`
- Output goes to `dist/` for CDK deployment
- Lambda uses Node.js 20.x runtime despite Bun being used for local dev

### Authentication Flow

- Cognito provides user pools and JWT tokens
- API Gateway validates JWT tokens before routing to Lambda
- Custom `cognitoId` attribute in DynamoDB User model links Cognito and app users
- User roles stored in both Cognito (custom attribute) and DynamoDB

## Development Workflow

1. Make code changes in relevant workspace
2. Run `bun run type-check` to verify types
3. Test locally with `bun run dev:web` and/or `bun run dev:api`
4. Build to ensure everything compiles: `bun run build`
5. Deploy to dev environment: `bun run cdk:deploy:dev`
6. Test in dev environment
7. Promote to staging: `bun run cdk:deploy:stg`
8. Finally deploy to production: `bun run cdk:deploy:prd`
