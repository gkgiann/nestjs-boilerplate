# NestJS Enterprise Boilerplate - AI Agent Instructions

## 🎯 Purpose

This repository is a reusable **NestJS enterprise-grade boilerplate**
designed to serve as the foundation for any backend API.

It implements:

-   Clean Architecture
-   Domain-Driven Design (DDD) simplified
-   Layered modular structure
-   JWT Authentication with refresh token rotation
-   Structured logging (Pino)
-   Global error handling
-   Standardized HTTP responses
-   Prisma ORM
-   Dockerized environment
-   Environment validation with Zod
-   Swagger documentation
-   Transaction safety patterns

This project is domain-agnostic. It must remain generic and reusable.

------------------------------------------------------------------------

# 🏗️ Architectural Principles

1.  Explicit over implicit
2.  Strict separation of concerns
3.  No business logic in controllers
4.  No HTTP logic in domain
5.  No direct Prisma usage in controllers
6.  Use cases orchestrate business rules
7.  Repositories encapsulate data access
8.  All input must be validated
9.  All errors must be standardized
10. Code must be production-ready

------------------------------------------------------------------------

# 📁 Mandatory Module Structure

Every feature module MUST follow:

modules/`<feature>`{=html}/ ├── application/ │ └── use-cases/ ├──
domain/ │ ├── entities/ │ └── rules/ ├── infra/ │ └── repositories/ ├──
dto/ ├── `<feature>`{=html}.controller.ts └──
`<feature>`{=html}.module.ts

Never create generic `service.ts` files for business logic.

------------------------------------------------------------------------

# 🧱 Layer Responsibilities

## Controllers

-   Orchestrate HTTP only
-   Validate DTOs
-   Call use cases
-   No business logic

## Use Cases

-   Contain all business logic
-   Coordinate repositories
-   Enforce domain rules
-   Throw domain exceptions

## Repositories

-   Encapsulate Prisma queries
-   No business logic
-   No HTTP awareness

## Domain

-   Pure business rules
-   Framework-agnostic
-   No NestJS imports

------------------------------------------------------------------------

# 🌐 Global API Standards

## Global Prefix

/api/v1

## Swagger

/api/docs

Configured in main.ts.

------------------------------------------------------------------------

# 📡 Standard HTTP Response Format

## Success

{ "success": true, "data": {}, "timestamp": "ISO_8601" }

## Error

{ "success": false, "error": { "code": "ERROR_CODE", "message":
"Readable message" }, "timestamp": "ISO_8601" }

Implemented via global interceptor + global exception filter.

Never expose stack traces or raw Prisma errors.

------------------------------------------------------------------------

# 🚨 HTTP Status Mapping

  Status   Meaning
  -------- -------------------------
  400      Validation error
  401      Unauthorized
  403      Forbidden
  404      Not found
  409      Conflict
  422      Business rule violation
  500      Internal error

------------------------------------------------------------------------

# 🔐 Authentication Architecture

This boilerplate includes:

-   JWT Access Token (short-lived)
-   JWT Refresh Token (long-lived)
-   Refresh token rotation
-   Multiple device support
-   Role-based access control (RBAC)
-   Guards
-   Custom decorators (@CurrentUser, @Roles)

### Critical Rules

-   Never trust client-sent roles
-   Refresh tokens must be hashed before saving
-   Refresh tokens must support revocation
-   Access tokens are stateless
-   Refresh tokens are stateful

------------------------------------------------------------------------

# 🔄 Transaction Safety

Use prisma.\$transaction() for any multi-step write operation.

Never perform related updates without a transaction.

------------------------------------------------------------------------

# ⚙️ Environment Configuration

-   Never use process.env directly
-   Use @nestjs/config
-   Validate with Zod
-   Application must fail at startup if required variables are missing

------------------------------------------------------------------------

# 📊 Logging Rules

-   Do NOT use console.log
-   Use structured logger (Pino)
-   Log:
    -   Application startup
    -   Errors
    -   Critical operations
    -   Authentication events

Logs must include contextual identifiers when available.

------------------------------------------------------------------------

# 🧪 Testing Standards

Every feature should include:

-   Unit tests for use cases
-   Integration tests when relevant
-   Explicit test naming

------------------------------------------------------------------------

# 🧩 Boilerplate Expectations

This repository must always include:

-   Auth module fully implemented
-   Example feature module (sample CRUD)
-   Pagination helper pattern
-   Base DTO validation pattern
-   Global exception handling
-   Docker configuration
-   Prisma setup
-   Logger configuration
-   Swagger setup

This project must be reusable as a base for any API.

------------------------------------------------------------------------

# 🚫 Forbidden Practices

-   Business logic inside controllers
-   Direct Prisma usage in controllers
-   Using any
-   Skipping validation
-   Returning raw database errors
-   Silent catch blocks
-   Mixing domain and HTTP concerns

------------------------------------------------------------------------

# 🛠 Code Generation Rules

When generating code:

1.  Always start with a Use Case.
2.  Follow the exact layered structure.
3.  Create DTOs with validation decorators.
4.  Throw domain-specific errors.
5.  Use dependency injection.
6.  Keep controllers thin.
7.  Keep business rules explicit.
8.  Keep modules self-contained.
9.  Ensure strong typing.
10. Follow single responsibility principle.

------------------------------------------------------------------------

# 🎯 Goal of This Boilerplate

To provide a production-ready, enterprise-grade foundation that can be
extended into any backend system without architectural refactoring.

All future development must respect this contract.




# Boilerplate Architecture Additions

## 🎯 Purpose

This document complements the core boilerplate instructions and defines:

-   Standard module blueprint
-   Official Users module as reference CRUD
-   Global pagination pattern
-   Reusable structure for future modules

This ensures the boilerplate is scalable and production-ready.

------------------------------------------------------------------------

# 🧱 Official Module Blueprint

Every new module MUST follow this structure:

modules/`<feature>`{=html}/ ├── application/ │ └── use-cases/ ├──
domain/ │ ├── entities/ │ └── rules/ ├── infra/ │ └── repositories/ ├──
dto/ ├── `<feature>`{=html}.controller.ts └──
`<feature>`{=html}.module.ts

### Rules

-   No business logic in controllers
-   No Prisma usage outside repositories
-   Use cases orchestrate logic
-   Domain must be framework-agnostic
-   Modules must be self-contained

------------------------------------------------------------------------

# 👤 Users Module (Reference CRUD)

The Users module serves as the official example implementation for
future modules.

## Responsibilities

-   CreateUser
-   UpdateUser
-   DeleteUser
-   GetUserById
-   ListUsers (paginated)

## Separation of Concerns

-   AuthModule handles authentication
-   UsersModule handles user management
-   Role-based access control enforced via guards

------------------------------------------------------------------------

# 📄 Standard Pagination Pattern

Pagination is mandatory for all list endpoints.

## Pagination Query DTO

-   page (default: 1)
-   limit (default: 10)
-   limit max: 100

## Response Format

{ "success": true, "data": { "items": \[\], "meta": { "page": 1,
"limit": 10, "total": 120, "totalPages": 12 } }, "timestamp": "ISO_8601"
}

### Rules

-   Never return raw arrays
-   Always include meta object
-   Always calculate totalPages
-   Enforce maximum limit

------------------------------------------------------------------------

# 🧩 Common Directory Structure

src/ ├── common/ │ ├── filters/ │ ├── interceptors/ │ ├── decorators/ │
├── guards/ │ ├── pagination/ │ └── exceptions/ │ ├── config/ │ ├──
env.schema.ts │ └── configuration.ts │ ├── modules/ │ ├── auth/ │ ├──
users/ │ └── example/ (optional) │ ├── prisma/ │ └── prisma.service.ts │
├── app.module.ts └── main.ts

------------------------------------------------------------------------

# 🏗 Architectural Intent

This boilerplate must:

-   Be domain-agnostic
-   Be reusable across projects
-   Enforce structural discipline
-   Encourage clean architecture
-   Provide production-level patterns

------------------------------------------------------------------------

# 🚀 Implementation Priority

1.  Complete Auth module
2.  Implement Users CRUD as reference
3.  Implement global pagination utilities
4.  Finalize documentation
5.  Tag version v1.0

This establishes a solid, reusable backend foundation.