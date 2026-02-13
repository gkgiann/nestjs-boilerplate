# EventGO API - AI Agent Instructions

## Architecture Overview

**EventGO** is an enterprise-grade event management SaaS backend implementing Clean Architecture + Domain-Driven Design (DDD) with NestJS.

**⚠️ Critical:** Always consult [`docs/ARCHITECTURE_CONTEXT.md`](../docs/ARCHITECTURE_CONTEXT.md) for comprehensive architectural rules and rationale.

## Mandatory Module Structure

Every feature module MUST follow this layered structure:

```
modules/<feature>/
├── application/use-cases/     # Business logic orchestration
├── domain/
│   ├── entities/              # Domain models
│   └── rules/                 # Business rules
├── infra/repositories/        # Prisma data access
├── dto/                       # Request/response validation
├── <feature>.controller.ts    # HTTP orchestration only
└── <feature>.module.ts
```

**Example:** For a "registrations" feature, create `modules/registrations/application/use-cases/create-registration.use-case.ts`, not a service file.

## Layer Responsibilities (Strict)

- **Controllers**: Only route requests to use cases. Zero business logic. Always use validated DTOs.
- **Use Cases**: Contain ALL business logic, enforce domain rules, coordinate repositories, throw domain exceptions.
- **Repositories**: Encapsulate Prisma queries. No business logic, no HTTP awareness.
- **Domain**: Pure business rules and entities. Framework-agnostic.

## Global Standards

### API Response Format

All endpoints return:
```typescript
// Success
{ "success": true, "data": {...}, "timestamp": "ISO_8601" }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." }, "timestamp": "ISO_8601" }
```

Implement via global response interceptor. Never return raw Prisma errors or expose stack traces.

### HTTP Error Mapping
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden  
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Business rule violation
- `500` - Internal error

Use a `GlobalExceptionFilter` to enforce these mappings.

### Global Prefix
All routes: `/api/v1/*`  
Swagger docs: `/api/docs`

Configure in `main.ts` via `app.setGlobalPrefix()`.

## Critical Patterns

### Transaction Safety
Use `prisma.$transaction()` for:
- Registration creation + batch updates
- Payment confirmation + registration state change
- Any multi-step data modification

```typescript
await this.prisma.$transaction([
  this.prisma.registration.create(...),
  this.prisma.batch.update({ where: ..., data: { soldQuantity: { increment: 1 } } })
]);
```

### Environment Configuration
- Never use `process.env` directly
- Validate all vars with Zod schema in `config/env.schema.ts`
- Use `@nestjs/config` ConfigService
- App should crash on startup if required vars missing

### Logging
- Forbidden: `console.log()`
- Required: Structured logger (Pino) via `core/logger/`
- Log: registration creation, payments, webhooks, business rule violations, exceptions

### Authentication & Authorization
- JWT access + refresh tokens
- RBAC with custom `@Roles()` decorator
- Guards in `core/guards/`
- Never trust client-sent role claims

### Payment Idempotency
- `providerPaymentId` must be unique constraint
- Webhook handlers must safely handle duplicates
- Use transactions for payment → registration confirmation flow
- Validate payment state transitions

## Development Commands

```bash
npm run start:dev          # Watch mode
npm run build              # Production build
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run lint               # ESLint with auto-fix
```

## Key Files to Reference

- [`docs/ARCHITECTURE_CONTEXT.md`](../docs/ARCHITECTURE_CONTEXT.md) - Complete architectural contract
- `src/main.ts` - Bootstrap configuration (global prefix, Swagger, validation pipe)
- `src/config/` - Environment setup

## Code Generation Rules

1. **Always start with use case**, not a generic service
2. Follow exact directory structure from architecture doc
3. Implement domain validation in `domain/rules/`, not in controllers
4. Create custom exceptions in `core/exceptions/` that map to HTTP status codes
5. Validate DTOs with `class-validator` decorators
6. Use dependency injection, never instantiate repositories directly

## Quality Gates

Before marking implementation complete:
- [ ] Follows layered module structure
- [ ] Uses standardized response format
- [ ] Includes transaction for multi-step operations
- [ ] Logs critical operations with structured logger
- [ ] Validates input with DTOs
- [ ] Throws domain exceptions (not HTTP exceptions in use cases)
- [ ] Includes unit tests for domain rules
