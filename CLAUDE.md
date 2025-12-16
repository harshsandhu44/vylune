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

Two environments configured in `infra/cdk/config/environments.ts`:

1. **dev**: Development (eu-central-1)
   - Resources: VyluneTable-Dev, vylune-users-dev, vylune-api-dev
   - CORS: localhost:3000, localhost:3001, stg.vylune.com
   - Removal policy: DESTROY
   - Used for: Local development and staging deployments

2. **prd**: Production (eu-central-1)
   - Resources: VyluneTable-Prd, vylune-users-prd, vylune-api-prd
   - CORS: <https://vylune.com>, <https://www.vylune.com>
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
6. Test in dev environment (supports both localhost and stg.vylune.com)
7. Deploy to production: `bun run cdk:deploy:prd`

## 🚧 In Progress: Organization & Subscription Management (Polar.sh Integration)

**Goal**: Implement mandatory organization requirement with Polar.sh payment integration featuring 7-day trial and seat-based pricing (€25 for 5 seats, €10 per additional seat).

### ✅ Completed (Phase 1: Database Schema)

**Backend Schema Updates:**
- ✅ Updated Organization model with subscription fields:
  - `subscriptionStatus`, `trialStartDate`, `trialEndDate`
  - `polarCustomerId`, `polarSubscriptionId`, `polarCheckoutId`
  - `seatCount`, `baseSeatCount`, `additionalSeats`
  - `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`
- ✅ Added Subscription model for subscription history tracking
- ✅ Added PolarWebhookEvent model for webhook idempotency
- ✅ Updated Product model with `organizationId` for organization scoping
- ✅ Updated StockMovement model with `organizationId` for organization scoping
- ✅ Updated GSI1 patterns for organization-scoped queries
- ✅ Updated database client exports for new models

**Zod Schema Updates:**
- ✅ Updated `OrganizationSchema` with subscription fields
- ✅ Added `SubscriptionStatusSchema` enum
- ✅ Added `SubscriptionSchema` and `CreateSubscriptionSchema`
- ✅ Updated `CreateOrganizationSchema` to make subscription fields optional

### ✅ Completed (Phase 2: Backend API - Partial)

**Context & Middleware:**
- ✅ Updated `services/api/src/context.ts` to extract `x-organization-id` header
- ✅ Added Subscription and PolarWebhookEvent models to context
- ✅ Created `services/api/src/middleware/organization.middleware.ts`:
  - `requireOrganization()` - Verifies user is active member
  - `requireLeader()` - Verifies user is organization leader
  - `requireActiveSubscription()` - Checks trial/subscription status

**Routers:**
- ✅ Created `services/api/src/routers/organization.router.ts`:
  - `get()` - Get organization by ID
  - `create()` - Create organization with 7-day trial
  - `update()` - Update organization name
  - `getSubscriptionStatus()` - Get subscription status with days remaining
  - `getSeatUsage()` - Get seat usage statistics
  - `transferLeadership()` - Transfer leadership to another member

### ⏳ Remaining Tasks

**Phase 2: Backend API (Remaining):**
- ⏳ Create `services/api/src/services/polar.service.ts`:
  - `createCheckout()` - Create Polar.sh checkout session
  - `updateSubscription()` - Update subscription seat count
  - `cancelSubscription()` - Cancel subscription
  - `verifyWebhookSignature()` - Verify webhook signatures
- ⏳ Create `services/api/src/routers/subscription.router.ts`:
  - `createCheckout()` - Initiate payment flow
  - `updateSeats()` - Add/remove seats
  - `cancelSubscription()` - Cancel subscription
  - `getHistory()` - Get subscription history
- ⏳ Create `services/api/src/routers/member.router.ts`:
  - `invite()` - Invite member with seat check
  - `remove()` - Remove member from organization
  - `acceptInvitation()` - Accept pending invitation
  - `rejectInvitation()` - Reject invitation
  - `list()` - List organization members
  - `listPending()` - List pending invitations
- ⏳ Update `services/api/src/routers/product.router.ts`:
  - Add `requireOrganization()` middleware to all endpoints
  - Add `requireActiveSubscription()` middleware
  - Add `organizationId` to create operations
  - Update list queries to filter by organization
- ⏳ Update `services/api/src/routers/stock.router.ts`:
  - Add organization middleware
  - Add `organizationId` to create operations
  - Update queries for organization scoping
- ⏳ Update `services/api/src/index.ts`:
  - Add organization, subscription, and member routers to main router
- ⏳ Create `services/api/src/utils/webhook-handler.ts`:
  - Webhook handler Lambda for Polar.sh events
  - Handle: subscription.created, subscription.updated, subscription.cancelled
  - Idempotency checks using PolarWebhookEvent model

**Phase 3: Frontend State Management:**
- ⏳ Create `apps/web/stores/organization.store.ts`:
  - Organization state with current organization and list
  - Computed helpers: `isLeader()`, `isTrialActive()`, `canAccessApp()`, `daysRemainingInTrial()`
- ⏳ Update `apps/web/lib/trpc.ts`:
  - Add `x-organization-id` header to all requests
- ⏳ Create `apps/web/providers/organization-provider.tsx`:
  - Fetch user organizations on mount
  - Auto-select first organization if none selected
  - Provide organization context to app

**Phase 4: Frontend UI Components:**
- ⏳ Create `apps/web/app/(auth)/onboarding/page.tsx`:
  - Multi-step wizard: Welcome → Create Org → Trial Activated
- ⏳ Update `apps/web/app/(auth)/verify-email/page.tsx`:
  - Redirect to `/onboarding` instead of `/`
- ⏳ Create `apps/web/components/organization-switcher.tsx`:
  - Dropdown to switch between organizations
- ⏳ Update `apps/web/components/app-sidebar/index.tsx`:
  - Add organization switcher to sidebar header
- ⏳ Create `apps/web/components/trial-banner.tsx`:
  - Show trial status and upgrade prompt
- ⏳ Create `apps/web/app/(app)/settings/organization/page.tsx`:
  - Settings page with tabs: General, Members, Billing
- ⏳ Create `apps/web/components/settings/organization-general.tsx`:
  - Organization name, leader, transfer leadership
- ⏳ Create `apps/web/components/settings/organization-members.tsx`:
  - List members, invite/remove members, show pending invitations
- ⏳ Create `apps/web/components/settings/organization-billing.tsx`:
  - Subscription status, seat usage, upgrade button, seat management
- ⏳ Create `apps/web/app/(app)/payment/success/page.tsx`:
  - Landing page after Polar.sh payment redirect
  - Poll for subscription activation
- ⏳ Update `apps/web/components/auth/route-guard.tsx`:
  - Add organization requirement check
  - Redirect to onboarding if no organization
  - Check subscription status for protected routes
  - Redirect to billing if trial/subscription expired

**Phase 5: Infrastructure Updates:**
- ⏳ Update `infra/cdk/lib/cdk-stack.ts`:
  - Add webhook Lambda handler
  - Add environment variables for Polar.sh configuration
- ⏳ Update `infra/cdk/lib/constructs/api-gateway.ts`:
  - Add `/webhooks/polar` route (no auth)
- ⏳ Set environment variables:
  - `POLAR_API_KEY`, `POLAR_BASE_PRODUCT_ID`, `POLAR_ADDITIONAL_SEAT_PRICE_ID`
  - `POLAR_WEBHOOK_SECRET`, `FRONTEND_URL`

**Phase 6: Polar.sh Configuration:**
- ⏳ Create products in Polar.sh dashboard:
  - Base Product: "Vylune Inventory - Base Plan" (€25/month, 5 seats)
  - Additional Seat: "Additional Seat" (€10/month per seat)
- ⏳ Configure webhook in Polar.sh:
  - URL: API Gateway webhook endpoint
  - Events: subscription.created, subscription.updated, subscription.cancelled
- ⏳ Save Polar.sh credentials to environment

**Phase 7: Testing & Deployment:**
- ⏳ Type check all workspaces
- ⏳ Test organization creation and trial activation
- ⏳ Test Polar.sh checkout flow (test mode)
- ⏳ Test webhook event processing
- ⏳ Test organization switching
- ⏳ Test seat management
- ⏳ Deploy to dev environment
- ⏳ End-to-end testing in dev

### Implementation Plan

**Full plan available at**: `~/.claude/plans/goofy-fluttering-pine.md`

**Key Features:**
- Organization-first architecture with all data scoped to organizations
- 7-day trial period with automatic activation
- Polar.sh redirect checkout with tiered pricing
- Multi-organization support with switcher
- Full member management (invite, remove, transfer leadership)
- Subscription enforcement via middleware
- Webhook handling with idempotency
