# EventGO API - Guia de Setup

## ✅ Configurações Aplicadas

### 1. Prefixo Global e CORS
- **Prefixo**: `/api/v1`
- **CORS**: Configurado via variável `CORS_ORIGINS`
- **Validation Pipe**: Global com whitelist e transform ativados

### 2. Estrutura de Pastas
```
src/
├── config/               # Configuração e validação de ambiente (Zod)
├── core/                 # Cross-cutting concerns
│   ├── decorators/       # Decorators customizados
│   ├── exceptions/       # Exceções de domínio
│   ├── filters/          # Filtro global de exceções
│   ├── guards/           # Guards de autenticação/autorização
│   ├── interceptors/     # Interceptor de resposta global
│   └── logger/           # Logger estruturado
└── modules/              # Módulos de features
```

### 3. Interceptores e Filtros Globais

#### Response Interceptor
Padroniza todas as respostas de sucesso:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-13T10:30:00.000Z"
}
```

#### Global Exception Filter
Padroniza todas as respostas de erro:
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

### 4. Exceções de Domínio

Exceções customizadas criadas em `src/core/exceptions/`:
- `DomainException`: Base para exceções de domínio
- `BusinessRuleViolationException`: Violação de regra de negócio (422)
- `ResourceNotFoundException`: Recurso não encontrado (404)
- `DuplicateResourceException`: Recurso duplicado (409)

**Exemplo de uso:**
```typescript
import { ResourceNotFoundException } from '@core/exceptions';

throw new ResourceNotFoundException('Event', eventId);
// Response: 404 { error: { code: "DOMAIN_EXCEPTION", message: "Event with identifier '123' not found" } }
```

### 5. Path Aliases

Aliases configurados no `tsconfig.json`:
```typescript
import { DomainException } from '@core/exceptions';
import { envSchema } from '@config/env.schema';
import { CreateUserUseCase } from '@modules/users/application/use-cases';
```

### 6. Configuração de Ambiente

Validação automática com Zod em `src/config/env.schema.ts`:
- `NODE_ENV`, `PORT`, `DATABASE_URL`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `CORS_ORIGINS`

**O app não inicia se variáveis obrigatórias estiverem faltando!**

### 7. ESLint + Prettier

- **Prettier**: Configurado com single quotes, trailing commas, 100 chars
- **ESLint**: TypeScript strict mode com regras customizadas
- **Scripts**: `npm run lint` e `npm run format`

## 🚀 Próximos Passos

1. **Configurar Prisma**
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Criar primeiro módulo seguindo Clean Architecture**
   ```bash
   # Estrutura exemplo para módulo de eventos
   mkdir -p src/modules/events/{application/use-cases,domain/{entities,rules},infra/repositories,dto}
   ```

3. **Configurar Swagger**
   ```bash
   npm install @nestjs/swagger
   ```

4. **Configurar Logger (Pino)**
   ```bash
   npm install nestjs-pino pino-http pino-pretty
   ```

5. **Configurar JWT Auth**
   ```bash
   npm install @nestjs/jwt @nestjs/passport passport passport-jwt
   npm install -D @types/passport-jwt
   ```

## 📚 Referências

- [NestJS Documentation](https://docs.nestjs.com)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- Documentação completa: [`docs/ARCHITECTURE_CONTEXT.md`](../docs/ARCHITECTURE_CONTEXT.md)
