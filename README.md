# Vylune - Inventory Management System

Bun-powered monorepo for a modern inventory management system with multi-environment support.

## Architecture

- **Apps**: Next.js web application
- **Packages**: Shared schemas, types, and utilities
- **Services**: tRPC API with Lambda handlers
- **Infra**: AWS CDK infrastructure definitions

## Tech Stack

- **Runtime**: Bun
- **Frontend**: Next.js 15 (App Router), shadcn/ui, Tailwind 4
- **Backend**: tRPC, AWS Lambda, DynamoDB (OneTable)
- **Infrastructure**: AWS CDK
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## Workspace Structure

```
vylune/
├── apps/web/            # Next.js application
├── packages/core/       # Shared schemas and types
├── services/api/        # tRPC API with Lambda handlers
└── infra/cdk/          # AWS CDK infrastructure
```

## Getting Started

```bash
# Install dependencies
bun install

# Development
bun run dev:web          # Start Next.js dev server
bun run dev:api          # Start API in watch mode

# Build
bun run build            # Build all workspaces

# Type checking
bun run type-check       # Check types across all workspaces

# Linting & Formatting
bun run lint             # Run ESLint
bun run lint:fix         # Fix ESLint issues
bun run format           # Format with Prettier
bun run format:check     # Check formatting
```

## Environments

The infrastructure supports three environments:

### Development (dev)
- **Region**: eu-central-1
- **Resources**: VyluneTable-Dev, vylune-users-dev, vylune-api-dev
- **CORS**: localhost:3000, localhost:3001
- **Removal Policy**: DESTROY (resources deleted on stack deletion)

### Staging (stg)
- **Region**: eu-central-1
- **Resources**: VyluneTable-Stg, vylune-users-stg, vylune-api-stg
- **CORS**: https://stg.vylune.com
- **Removal Policy**: RETAIN (resources preserved on stack deletion)

### Production (prd)
- **Region**: eu-central-1
- **Resources**: VyluneTable-Prd, vylune-users-prd, vylune-api-prd
- **CORS**: https://vylune.com, https://www.vylune.com
- **Removal Policy**: RETAIN (resources preserved on stack deletion)

## Infrastructure Deployment

### Synthesize CloudFormation templates

```bash
bun run cdk:synth:dev
bun run cdk:synth:stg
bun run cdk:synth:prd
```

### Deploy to environments

```bash
bun run cdk:deploy:dev
bun run cdk:deploy:stg
bun run cdk:deploy:prd
```

### Show differences

```bash
bun run cdk:diff:dev
bun run cdk:diff:stg
bun run cdk:diff:prd
```

### Stack Outputs

Each environment exports:
- **UserPoolId**: Cognito User Pool ID
- **UserPoolClientId**: Cognito User Pool Client ID
- **TableName**: DynamoDB Table Name
- **ApiUrl**: API Gateway URL
- **Region**: AWS Region (eu-central-1)

## Project Structure Details

### Core Package (`@vylune/core`)

Shared Zod schemas and TypeScript types:
- **Product**: id, name, sku, description, price, quantity
- **StockMovement**: id, productId, type (IN/OUT/ADJUSTMENT), quantity, reason
- **User**: id, email, name, role (ADMIN/MANAGER/STAFF), cognitoId

### API Service (`@vylune/api`)

tRPC routers with DynamoDB OneTable:
- **Product Router**: CRUD operations
- **Stock Router**: List and create stock movements (auto-updates product quantity)
- **User Router**: User management

### Infrastructure (`@vylune/infra-cdk`)

AWS CDK stack with:
- **DynamoDB**: Single-table design with GSI
- **Cognito**: User pool with custom role attribute
- **Lambda**: API handlers (Node.js 20.x, bundled with Bun)
- **API Gateway**: HTTP API with Cognito JWT authorization

## Development Workflow

1. Make changes to code
2. Run type checking: `bun run type-check`
3. Test locally with `bun run dev`
4. Build: `bun run build`
5. Deploy to dev: `bun run cdk:deploy:dev`
6. Test in dev environment
7. Deploy to staging: `bun run cdk:deploy:stg`
8. Deploy to production: `bun run cdk:deploy:prd`

## Configuration

Environment configurations are defined in `infra/cdk/config/environments.ts`. Modify as needed for your AWS account and domain settings.
