# EventGO API

Enterprise-grade event management SaaS backend built with **NestJS**, implementing **Clean Architecture** and **Domain-Driven Design (DDD)**.

## 🏗️ Architecture

This project follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Business entities and rules (framework-agnostic)
- **Application Layer**: Use cases and business logic orchestration
- **Infrastructure Layer**: External concerns (database, HTTP, external services)
- **Presentation Layer**: Controllers and DTOs

For complete architectural documentation, see [`docs/ARCHITECTURE_CONTEXT.md`](docs/ARCHITECTURE_CONTEXT.md).

## 📁 Project Structure

```
src/
├── config/              # Environment configuration and validation
├── core/                # Cross-cutting concerns
│   ├── decorators/      # Custom decorators (@Roles, @CurrentUser)
│   ├── exceptions/      # Domain exceptions
│   ├── filters/         # Global exception filters
│   ├── guards/          # Authentication & authorization
│   ├── interceptors/    # Response formatting, logging
│   └── logger/          # Structured logging (Pino)
└── modules/             # Feature modules
    └── <feature>/
        ├── application/use-cases/  # Business logic
        ├── domain/
        │   ├── entities/           # Domain models
        │   └── rules/              # Business rules
        ├── infra/repositories/     # Data access
        ├── dto/                    # Request/response validation
        ├── <feature>.controller.ts
        └── <feature>.module.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- PostgreSQL >= 14.x

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd eventgo/api
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations (when Prisma is configured)
```bash
npx prisma migrate dev
```

### Development

```bash
# Start in watch mode
npm run start:dev

# The API will be available at http://localhost:3000/api/v1
```

### Build

```bash
# Production build
npm run build

# Start production server
npm run start:prod
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📝 Code Quality

```bash
# Lint with auto-fix
npm run lint

# Format code
npm run format
```

## 🌐 API Documentation

- **Base URL**: `http://localhost:3000/api/v1`
- **Swagger**: `http://localhost:3000/api/docs` (when configured)

### Response Format

All endpoints follow a standardized response format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-13T10:30:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2026-02-13T10:30:00.000Z"
}
```

## 🔐 Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

Critical variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret (min 32 chars)
- `CORS_ORIGINS`: Allowed origins for CORS

## 📚 Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma (to be configured)
- **Validation**: class-validator, Zod
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## 🤝 Contributing

1. Follow the architectural patterns documented in `docs/ARCHITECTURE_CONTEXT.md`
2. Always create use cases instead of generic services
3. Write tests for business logic
4. Use conventional commits

## 📄 License

UNLICENSED - Private project
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
