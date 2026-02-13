# 🚀 EventGO

## Enterprise Backend Architecture Context

------------------------------------------------------------------------

# 📌 Overview

**EventGO** is a production-grade SaaS backend for event management.

This project is intentionally designed to follow enterprise-level
architecture patterns, not simple CRUD practices.

It implements:

-   Clean Architecture
-   Domain-Driven Design (DDD)
-   Strict HTTP response standardization
-   Structured logging
-   Transaction safety
-   Idempotent financial flows
-   RBAC security
-   Dockerized infrastructure
-   Prisma ORM with PostgreSQL
-   Environment schema validation

All generated code must respect this architectural contract.

------------------------------------------------------------------------

# 🧠 Architectural Philosophy

EventGO prioritizes:

1.  Explicit over implicit
2.  Domain rules over framework shortcuts
3.  Strict separation of concerns
4.  Predictable behavior
5.  Idempotency for financial operations
6.  Strong input validation
7.  Centralized error handling
8.  Structured observability
9.  Type safety
10. Maintainability at scale

------------------------------------------------------------------------

# 🏗️ Technology Stack

### Backend Framework

-   NestJS
-   TypeScript

### ORM

-   Prisma

### Database

-   PostgreSQL

### Validation

-   class-validator
-   class-transformer
-   Zod (for environment validation)

### Authentication

-   JWT Access Token
-   JWT Refresh Token
-   RBAC (Role-Based Access Control)

### Logging

-   Structured logger (Pino)

### Documentation

-   Swagger

### Infrastructure

-   Docker
-   Docker Compose

------------------------------------------------------------------------

# 📁 Project Structure

    src/
     ├── core/
     │    ├── exceptions/
     │    ├── filters/
     │    ├── interceptors/
     │    ├── guards/
     │    ├── decorators/
     │    ├── logger/
     │
     ├── config/
     │    ├── env.schema.ts
     │    ├── configuration.ts
     │
     ├── modules/
     │    ├── auth/
     │    ├── users/
     │    ├── events/
     │    ├── registrations/
     │    ├── payments/
     │    ├── activities/
     │    ├── attendance/
     │
     └── main.ts

------------------------------------------------------------------------

# 📦 Module Internal Structure Standard

Each module MUST follow:

    module-name/
     ├── application/
     │    ├── use-cases/
     │
     ├── domain/
     │    ├── entities/
     │    ├── rules/
     │
     ├── infra/
     │    ├── repositories/
     │
     ├── dto/
     │
     ├── module-name.controller.ts
     ├── module-name.module.ts

------------------------------------------------------------------------

# ⚠️ Strict Rules

### Controllers

-   NEVER contain business logic
-   ONLY orchestrate request → use case
-   Always use DTO validation

### Use Cases

-   Contain business logic
-   Enforce domain rules
-   Use repositories
-   Throw domain exceptions

### Repositories

-   Encapsulate Prisma access
-   No business logic
-   No HTTP logic

### Domain

-   Contains pure business rules
-   Must be framework-agnostic

------------------------------------------------------------------------

# 🌐 Global API Standards

Global prefix:

/api/v1

Swagger endpoint:

/api/docs

------------------------------------------------------------------------

# 📡 Global HTTP Response Format

## Success Response

{ "success": true, "data": {}, "timestamp": "ISO_8601_DATE" }

## Error Response

{ "success": false, "error": { "code": "ERROR_CODE", "message":
"Readable message" }, "timestamp": "ISO_8601_DATE" }

Never: - Return raw Prisma errors - Expose stack traces - Leak internal
details

------------------------------------------------------------------------

# 🚨 Global Error Handling

A GlobalExceptionFilter must:

-   Catch all exceptions
-   Normalize HTTP responses
-   Map domain errors to correct HTTP status codes
-   Log unexpected errors

Standard HTTP mappings:

-   400 Validation error
-   401 Unauthorized
-   403 Forbidden
-   404 Not Found
-   409 Conflict
-   422 Business rule violation
-   500 Internal error

------------------------------------------------------------------------

# 🔐 Authentication & Authorization

System must implement:

-   JWT Access Token
-   JWT Refresh Token
-   RBAC
-   Event-specific roles
-   Guards
-   Custom decorators (@Roles)

Never trust client-side role assertions.

------------------------------------------------------------------------

# 💳 Payment & Financial Safety Rules

Payments are critical domain operations.

Requirements:

-   Idempotency enforcement
-   providerPaymentId must be unique
-   Webhook processing must be safe for duplicates
-   Payment updates must validate previous state
-   Never trust webhook payload blindly
-   Use transactions for financial flows

------------------------------------------------------------------------

# 🔄 Transaction Rules

All critical operations MUST use Prisma transaction.

Examples:

-   Creating event registration
-   Updating batch soldQuantity
-   Creating payment record
-   Confirming registration after payment

Use prisma.\$transaction()

------------------------------------------------------------------------

# 📊 Logging Rules

Do NOT use console.log.

Use structured logger.

Log levels:

-   INFO
-   WARN
-   ERROR
-   DEBUG

Mandatory log cases:

-   Registration creation
-   Payment attempt
-   Webhook received
-   Business rule violation
-   Unexpected exception

------------------------------------------------------------------------

# ⚙️ Environment Configuration Rules

Never use process.env directly.

Use:

-   @nestjs/config
-   Zod schema validation

Application must fail to start if required environment variables are
missing.

------------------------------------------------------------------------

# 🧪 Testing Standards

Required:

-   Unit tests for domain rules
-   Integration tests for flows
-   Payment idempotency tests
-   Concurrency tests for batch limits

------------------------------------------------------------------------

# 🏁 Final Goal

EventGO must simulate a real-world SaaS backend architecture.

It must be:

-   Production-ready
-   Secure
-   Maintainable
-   Scalable
-   Predictable
-   Architecturally consistent

This document defines the architectural contract of the system.
