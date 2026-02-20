# Documentação Técnica - NestJS Boilerplate

## Índice

- [1. Visão Geral](#1-visão-geral)
- [2. Arquitetura](#2-arquitetura)
- [3. Estrutura de Pastas](#3-estrutura-de-pastas)
- [4. Stack Tecnológica](#4-stack-tecnológica)
- [5. Ambiente Docker](#5-ambiente-docker)
- [6. Configuração](#6-configuração)
- [7. Módulos](#7-módulos)
- [8. Padrões Arquiteturais](#8-padrões-arquiteturais)
- [9. Segurança](#9-segurança)
- [10. Testes](#10-testes)
- [11. API Reference](#11-api-reference)
- [12. Guia de Desenvolvimento](#12-guia-de-desenvolvimento)

---

## 1. Visão Geral

Este boilerplate é uma implementação profissional de API REST usando NestJS 11, seguindo princípios de Clean Architecture e Domain-Driven Design (DDD). Foi projetado para servir como base sólida para aplicações escaláveis, mantíveis e testáveis.

### Características Principais

- ✅ **Clean Architecture** com separação clara de responsabilidades
- ✅ **Domain-Driven Design (DDD)** com entidades de domínio e repositórios
- ✅ **Type Safety** completo com TypeScript e validação de ambiente
- ✅ **Autenticação JWT** com Access e Refresh Tokens
- ✅ **Segurança** avançada (bcrypt, rate limiting, CORS)
- ✅ **Documentação Swagger** automática
- ✅ **Logging** estruturado com Pino
- ✅ **Paginação** reutilizável e eficiente
- ✅ **Auditoria** de ações críticas
- ✅ **Testes** unitários e E2E
- ✅ **CI/CD** completo com GitHub Actions
- ✅ **Docker** para desenvolvimento containerizado

> 🐳 **Nota Importante:** Todo o desenvolvimento é feito via Docker! Não é necessário instalar Node.js localmente.

---

## 2. Arquitetura

### 2.1. Clean Architecture

O projeto segue os princípios da Clean Architecture, organizando o código em camadas concêntricas:

```
┌─────────────────────────────────────┐
│       Controllers (HTTP/REST)       │  ← Presentation Layer
├─────────────────────────────────────┤
│         Use Cases (Business)        │  ← Application Layer
├─────────────────────────────────────┤
│    Entities + Repository Interface  │  ← Domain Layer
├─────────────────────────────────────┤
│   Repository Implementations (DB)   │  ← Infrastructure Layer
└─────────────────────────────────────┘
```

**Regras de Dependência:**
- Camadas externas dependem de camadas internas
- Camadas internas **nunca** dependem de camadas externas
- Domain é independente de frameworks e bibliotecas

### 2.2. Domain-Driven Design (DDD)

Cada módulo de negócio é estruturado seguindo DDD:

```
module/
├── application/        # Casos de uso (orquestração)
│   └── use-cases/
├── domain/            # Regras de negócio puras
│   ├── entities/      # Modelos de domínio
│   ├── repositories/  # Contratos (interfaces)
│   └── errors/        # Exceções de domínio
├── infra/            # Implementações concretas
│   └── repositories/  # Implementações Prisma
├── dto/              # Validação de entrada/saída
├── guards/           # Proteção de rotas
├── decorators/       # Decorators customizados
└── module.controller.ts
```

---

## 3. Estrutura de Pastas

### 3.1. Estrutura Completa

```
nestjs-boilerplate/
│
├── prisma/                          # Schema e migrations do banco
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── src/
│   ├── common/                      # Código compartilhado
│   │   ├── pagination/              # Sistema de paginação
│   │   └── security/                # Abstrações de segurança
│   │
│   ├── config/                      # Configurações type-safe
│   │   ├── configuration.ts         # Factories de config
│   │   ├── env.schema.ts            # Validação de env vars (Zod)
│   │   └── typed-config.service.ts  # Serviço de acesso tipado
│   │
│   ├── core/                        # Infraestrutura central
│   │   ├── database/                # PrismaService
│   │   ├── filters/                 # Exception filters globais
│   │   ├── interceptors/            # Interceptors globais
│   │   ├── logger/                  # Logger configurado (Pino)
│   │   └── health/                  # Health checks
│   │
│   ├── modules/                     # Módulos de negócio
│   │   ├── auth/                    # Autenticação
│   │   │   ├── application/use-cases/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── repositories/
│   │   │   │   └── errors/
│   │   │   ├── infra/repositories/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── decorators/
│   │   │   └── dto/
│   │   │
│   │   ├── users/                   # Gerenciamento de usuários
│   │   │   ├── application/use-cases/
│   │   │   ├── domain/
│   │   │   ├── infra/repositories/
│   │   │   └── dto/
│   │   │
│   │   └── audit/                   # Auditoria de ações
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
│   ├── unit/                        # Testes unitários (use cases)
│   ├── e2e/                         # Testes E2E (API)
│   └── utils/                       # Utilidades de teste
│
├── docker-compose.yml               # PostgreSQL + PgAdmin
├── package.json
└── tsconfig.json
```

### 3.2. Propósito das Pastas

#### `src/common/`
Código reutilizável entre módulos (paginação, utilitários, abstrações).

#### `src/config/`
Sistema de configuração type-safe. Todas as variáveis de ambiente são:
- Validadas com Zod no startup
- Acessadas via `TypedConfigService` (nunca `process.env`)
- Tipadas fortemente

#### `src/core/`
Infraestrutura compartilhada:
- **database/**: PrismaService e DatabaseModule
- **filters/**: Exception filters globais
- **interceptors/**: Response interceptor (padroniza respostas)
- **logger/**: Logger estruturado (Pino)
- **health/**: Endpoints de health check

#### `src/modules/`
Módulos de negócio seguindo Clean Architecture. Cada módulo é independente e segue a mesma estrutura:
- **application/use-cases/**: Lógica de negócio
- **domain/**: Entidades e contratos
- **infra/**: Implementações concretas
- **dto/**: Validação de entrada/saída
- **guards/**: Proteção de rotas
- **decorators/**: Decorators customizados

---

## 4. Stack Tecnológica

### 4.1. Core

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| **NestJS** | 11.x | Framework Node.js progressivo |
| **TypeScript** | 5.7.x | Superset JavaScript com tipagem |
| **Prisma** | 7.4.x | ORM moderno e type-safe |
| **PostgreSQL** | 16.x | Banco de dados relacional |

### 4.2. Autenticação & Segurança

| Tecnologia | Descrição |
|-----------|-----------|
| **@nestjs/passport** | Integração Passport.js |
| **@nestjs/jwt** | Geração e validação de JWT |
| **passport-jwt** | Estratégia JWT para Passport |
| **bcryptjs** | Hashing de senhas |
| **@nestjs/throttler** | Rate limiting |

### 4.3. Validação & Transformação

| Tecnologia | Descrição |
|-----------|-----------|
| **class-validator** | Validação baseada em decorators |
| **class-transformer** | Transformação de objetos |
| **zod** | Validação de schemas (env vars) |

### 4.4. Documentação & Logging

| Tecnologia | Descrição |
|-----------|-----------|
| **@nestjs/swagger** | Documentação OpenAPI |
| **nestjs-pino** | Logger de produção |
| **pino-pretty** | Formatação de logs |

### 4.5. Testes

| Tecnologia | Descrição |
|-----------|-----------|
| **Jest** | Framework de testes |
| **Supertest** | Testes de API HTTP |
| **@nestjs/testing** | Utilitários de teste NestJS |

### 4.6. Container & DevOps

| Tecnologia | Descrição |
|-----------|-----------|
| **Docker** | Containerização da aplicação |
| **Docker Compose** | Orquestração de containers |
| **GitHub Actions** | Pipeline de CI/CD automatizado |

---

## 5. Ambiente Docker

### 5.1. Visão Geral

O projeto utiliza **Docker** para todo o ambiente de desenvolvimento, garantindo consistência entre diferentes máquinas e facilitando o onboarding de novos desenvolvedores.

**Benefícios:**
- ✅ Sem necessidade de instalar Node.js localmente
- ✅ Ambiente consistente entre desenvolvedores
- ✅ Isolação completa de dependências
- ✅ Hot-reload automático
- ✅ Fácil gerenciamento de múltiplos serviços

### 5.2. Arquitetura dos Containers

O ambiente é composto por 3 serviços:

```yaml
services:
  postgres:       # Banco de dados PostgreSQL 16
  pgadmin:        # Interface web para PostgreSQL
  server:         # Aplicação NestJS
```

#### Serviço: `postgres`
- **Imagem:** `postgres:16`
- **Porta:** 5432
- **Healthcheck:** Verifica se o banco está pronto antes de subir outros serviços
- **Volume:** Persistência de dados em `postgres_data`

#### Serviço: `pgadmin`
- **Imagem:** `dpage/pgadmin4`
- **Porta:** 5050
- **Acesso:** admin@admin.com / admin123
- **Dependência:** Aguarda `postgres` estar healthy

#### Serviço: `server` (NestJS)
- **Base:** `node:24.13.1-alpine`
- **Porta:** 3000
- **Volume:** `.:/usr/src/app` (hot-reload)
- **Comando:** `npm run db:deploy && npm run start:dev`
- **Dependência:** Aguarda `postgres` estar healthy

### 5.3. Dockerfile

```dockerfile
FROM node:24.13.1-alpine

WORKDIR /usr/src/app

# Instala dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia código fonte
COPY . .

# Executa migrations e inicia em modo desenvolvimento
CMD ["sh", "-c", "npm run db:deploy && npm run start:dev"]
```

**Características:**
- Usa Alpine Linux (imagem leve)
- Instala dependências com `npm ci` (deterministic)
- Executa migrations automaticamente na inicialização
- Inicia em modo desenvolvimento com hot-reload

### 5.4. Comandos Docker Essenciais

#### Iniciar Ambiente

```bash
# Subir todos os serviços em background
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f server

# Ver logs de todos os serviços
docker-compose logs -f
```

#### Parar Ambiente

```bash
# Parar todos os serviços (mantém volumes)
docker-compose down

# Parar e remover volumes (limpa tudo)
docker-compose down -v
```

#### Rebuild

```bash
# Rebuild após mudanças no Dockerfile ou package.json
docker-compose up -d --build

# Rebuild forçado (sem cache)
docker-compose build --no-cache
docker-compose up -d
```

#### Executar Comandos no Container

```bash
# Executar comando no container `server`
docker-compose exec server <comando>

# Exemplos:
docker-compose exec server npm run lint
docker-compose exec server npm run test
docker-compose exec server npx prisma studio
docker-compose exec server npx prisma migrate dev --name my_migration

# Acessar shell interativo
docker-compose exec server sh
```

#### Gerenciar Banco de Dados

```bash
# Executar migrations
docker-compose exec server npx prisma migrate deploy

# Criar nova migration
docker-compose exec server npx prisma migrate dev --name description

# Resetar banco (CUIDADO!)
docker-compose exec server npx prisma migrate reset

# Seed do banco
docker-compose exec server npm run prisma db seed

# Acessar PostgreSQL CLI
docker-compose exec postgres psql -U user -d boilerplate_db
```

### 5.5. Hot Reload

O projeto está configurado com **hot-reload automático** via volume mount:

```yaml
volumes:
  - .:/usr/src/app
```

**Como funciona:**
1. Código local é montado dentro do container
2. NestJS detecta mudanças automaticamente (`--watch`)
3. Aplicação recarrega sem necessidade de rebuild

**O que requer rebuild:**
- Mudanças em `package.json` (novas dependências)
- Mudanças em `Dockerfile`
- Mudanças em configurações de build

### 5.6. Conexão entre Containers

Os containers se comunicam pela rede Docker `nestjs_network`.

**Importante:** Use nomes de serviços como hosts:

```bash
# ❌ ERRADO (para conexões internas)
DATABASE_URL=postgresql://user:password@localhost:5432/boilerplate_db

# ✅ CORRETO (usa nome do serviço)
DATABASE_URL=postgresql://user:password@postgres:5432/boilerplate_db
```

**De fora do Docker:**
- PostgreSQL: `localhost:5432`
- NestJS API: `localhost:3000`
- PgAdmin: `localhost:5050`

### 5.7. Troubleshooting

#### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs server

# Verificar status dos containers
docker-compose ps

# Rebuild limpo
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

#### Migrations não executam

```bash
# Executar manualmente
docker-compose exec server npx prisma migrate deploy

# Verificar conexão com banco
docker-compose exec server npx prisma db pull
```

#### Porta em uso

```bash
# Identificar processo usando a porta
sudo lsof -i :3000

# Ou mudar porta no docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

#### Hot-reload não funciona

```bash
# Verificar se volume está montado corretamente
docker-compose exec server ls -la /usr/src/app

# Reiniciar container
docker-compose restart server
```

---

## 6. Configuração

### 6.1. Variáveis de Ambiente

O projeto usa um sistema de configuração type-safe com validação em tempo de startup.

#### Arquivo `.env`

```bash
#################################
# Application
#################################
NODE_ENV=development
PORT=3000
APP_NAME=nestjs-boilerplate
APP_VERSION=1.0.0

#################################
# CORS
#################################
CORS_ORIGINS=http://localhost:5173,http://localhost:3001

#################################
# Database
#################################
# IMPORTANTE: Use 'postgres' como host (nome do serviço Docker)
DATABASE_URL=postgresql://user:password@postgres:5432/boilerplate_db

#################################
# JWT Authentication
#################################
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_REFRESH_EXPIRATION=7d

#################################
# Password Security
#################################
BCRYPT_SALT_ROUNDS=10

#################################
# Logging
#################################
LOG_LEVEL=info

#################################
# Rate Limiting
#################################
THROTTLE_TTL=60
THROTTLE_LIMIT=100
AUTH_THROTTLE_TTL=60
AUTH_THROTTLE_LIMIT=5
```

### 6.2. Validação de Ambiente

As variáveis são validadas usando Zod em [src/config/env.schema.ts](src/config/env.schema.ts):

```typescript
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(val => parseInt(val, 10)),
  DATABASE_URL: z.string().url().refine(
    url => url.startsWith('postgresql://'),
    'Must be PostgreSQL connection string'
  ),
  JWT_ACCESS_SECRET: z.string().min(32),
  // ... demais validações
});
```

**Se uma variável obrigatória estiver faltando ou inválida, a aplicação não inicia.**

### 6.3. Acesso às Configurações

**❌ NUNCA faça:**
```typescript
const port = process.env.PORT; // Não tipado, não validado
```

**✅ SEMPRE faça:**
```typescript
constructor(private config: TypedConfigService) {}

const port = this.config.app.port; // Tipado e validado
```

---

## 6. Módulos

### 6.1. Auth Module

**Localização:** `src/modules/auth/`

**Responsabilidades:**
- Registro de novos usuários
- Login com email/senha
- Geração de Access e Refresh Tokens
- Renovação de tokens
- Logout (revogação de tokens)

#### Use Cases

| Use Case | Descrição |
|----------|-----------|
| `RegisterUseCase` | Cria novo usuário e gera tokens |
| `LoginUseCase` | Autentica usuário e gera tokens |
| `RefreshTokenUseCase` | Renova access token usando refresh token |
| `LogoutUseCase` | Revoga todos os refresh tokens do usuário |

#### Endpoints

```
POST /api/v1/auth/register     # Registrar novo usuário
POST /api/v1/auth/login        # Fazer login
POST /api/v1/auth/refresh      # Renovar token
POST /api/v1/auth/logout       # Fazer logout
```

#### Fluxo de Autenticação

```
1. Login
   └─> Validar credenciais
   └─> Gerar Access Token (15min)
   └─> Gerar Refresh Token (7d)
   └─> Salvar hash do Refresh Token no banco
   └─> Retornar tokens + dados do usuário

2. Requests Autenticados
   └─> Client envia: Authorization: Bearer <access_token>
   └─> JwtStrategy valida token
   └─> Anexa user em request.user

3. Renovação
   └─> Client envia refresh token
   └─> Validar hash no banco
   └─> Gerar novo Access Token
   └─> Retornar novo token

4. Logout
   └─> Revogar todos refresh tokens do usuário
```

#### Guards

**JwtAuthGuard:** Protege rotas requerendo autenticação válida.

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: CurrentUserData) {
  return user;
}
```

**RolesGuard:** Restringe acesso baseado em papéis (roles).

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Delete(':id')
deleteUser(@Param('id') id: string) {
  // Somente ADMINs podem acessar
}
```

#### Decorators

**@CurrentUser():** Extrai dados do usuário autenticado.

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@CurrentUser() user: CurrentUserData) {
  // user = { id, name, email, role }
}
```

**@Roles(...roles):** Define papéis permitidos para o endpoint.

```typescript
@Roles('ADMIN', 'MODERATOR')
@Get('admin-only')
adminRoute() { }
```

### 6.2. Users Module

**Localização:** `src/modules/users/`

**Responsabilidades:**
- CRUD completo de usuários
- Listagem paginada
- Soft delete (isActive flag)
- Controle de acesso (ADMIN ou proprietário)

#### Use Cases

| Use Case | Descrição |
|----------|-----------|
| `CreateUserUseCase` | Cria novo usuário (somente ADMIN) |
| `GetUserUseCase` | Busca usuário por ID |
| `ListUsersUseCase` | Lista usuários com paginação e busca |
| `UpdateUserUseCase` | Atualiza dados do usuário |
| `DeleteUserUseCase` | Soft delete (isActive = false) |

#### Endpoints

```
POST   /api/v1/users           # Criar usuário (ADMIN only)
GET    /api/v1/users           # Listar usuários (ADMIN only)
GET    /api/v1/users/:id       # Buscar por ID (ADMIN ou owner)
PATCH  /api/v1/users/:id       # Atualizar (ADMIN ou owner)
DELETE /api/v1/users/:id       # Deletar (ADMIN only)
```

#### Paginação

Todos os endpoints de listagem suportam paginação:

```
GET /api/v1/users?page=1&limit=10&search=john&sortBy=createdAt&order=DESC
```

**Parâmetros:**
- `page`: Número da página (default: 1)
- `limit`: Itens por página (default: 10)
- `search`: Busca por nome ou email
- `sortBy`: Campo para ordenação (default: createdAt)
- `order`: ASC ou DESC (default: DESC)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  },
  "timestamp": "2026-02-18T10:30:00.000Z"
}
```

#### Soft Delete

O projeto implementa soft delete por padrão:
- O método `delete()` define `isActive = false`
- Usuários inativos não podem fazer login
- Existe `hardDelete()` para remoção permanente (uso restrito)

### 6.3. Audit Module

**Localização:** `src/modules/audit/`

**Responsabilidades:**
- Registrar ações críticas do sistema
- Armazenar logs em arquivos locais
- Capturar contexto (usuário, IP, timestamp)

#### Uso

Use o decorator `@Auditable` em controllers:

```typescript
@Post()
@Auditable('create', 'user')
async createUser(@Body() dto: CreateUserDto) {
  // Ação será auditada automaticamente
}
```

#### Formato de Log

```json
{
  "action": "create",
  "entity": "user",
  "userId": "uuid",
  "userEmail": "user@example.com",
  "ip": "127.0.0.1",
  "timestamp": "2026-02-18T10:30:00.000Z",
  "details": { "entityId": "uuid" }
}
```

#### Armazenamento

Logs são salvos em `audit-logs/audit-YYYY-MM-DD.log`.

### 6.4. Health Module

**Localização:** `src/core/health/`

**Endpoint:**
```
GET /api/v1/health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-18T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

## 7. Padrões Arquiteturais

### 7.1. Repository Pattern

O projeto usa Repository Pattern para abstrair acesso a dados.

#### Interface (Domain)

```typescript
// src/modules/users/domain/repositories/users.repository.interface.ts
export interface IUsersRepository {
  findById(id: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
  update(id: string, data: UpdateUserData): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  paginate(params: PaginationParams): Promise<PaginatedResponse<UserEntity>>;
}
```

#### Implementação (Infra)

```typescript
// src/modules/users/infra/repositories/prisma-users.repository.ts
@Injectable()
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
  // ... demais métodos
}
```

#### Injeção de Dependência

```typescript
// No module
providers: [
  {
    provide: 'UsersRepository',
    useClass: PrismaUsersRepository,
  },
]

// No use case
constructor(
  @Inject('UsersRepository')
  private readonly usersRepository: IUsersRepository,
) {}
```

**Benefícios:**
- Facilita testes (mock de interfaces)
- Permite trocar implementações (Prisma → TypeORM)
- Isola lógica de negócio de detalhes de persistência

### 7.2. Use Case Pattern

Cada operação de negócio é um Use Case isolado com método `execute()`.

#### Estrutura Padrão

```typescript
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UsersRepository') private repo: IUsersRepository,
    @Inject('PasswordHasher') private hasher: PasswordHasher,
  ) {}

  async execute(data: CreateUserDto): Promise<SafeUserEntity> {
    // 1. Validações de negócio
    const exists = await this.repo.emailExists(data.email);
    if (exists) throw new ConflictException();

    // 2. Lógica de domínio
    const hashedPassword = await this.hasher.hash(data.password);

    // 3. Persistência via repositório
    const user = await this.repo.create({
      ...data,
      password: hashedPassword,
    });

    // 4. Retorno seguro
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
```

**Benefícios:**
- Lógica isolada e testável
- Single Responsibility Principle
- Facilita manutenção e evolução

### 7.3. Domain Entities

Entidades de domínio são interfaces TypeScript independentes do Prisma.

```typescript
// src/modules/users/domain/entities/user.entity.ts
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUserEntity = Omit<UserEntity, 'password'>;
```

**Princípios:**
- Independente de frameworks
- Representa modelo de negócio
- Sempre retornar `SafeUserEntity` em APIs (sem senha)

### 7.4. DTOs (Data Transfer Objects)

DTOs validam entrada/saída usando `class-validator`.

```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'joao@exemplo.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;

  @ApiProperty({ enum: UserRole, default: 'USER' })
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;
}
```

**Princípios:**
- Sempre usar `class-validator` para validação
- Sempre documentar com `@ApiProperty` (Swagger)
- Usar `readonly` para imutabilidade

---

## 8. Segurança

### 8.1. Autenticação JWT

O projeto implementa autenticação JWT com Access e Refresh Tokens.

**Tokens:**
- **Access Token:** Curta duração (15min), usado em requests
- **Refresh Token:** Longa duração (7d), usado para renovar access token

**Fluxo:**
```
1. Login → Gera Access Token + Refresh Token
2. Requests → Enviado via Authorization: Bearer <access_token>
3. Expira → Cliente usa refresh token para obter novo access token
4. Logout → Revoga todos refresh tokens
```

### 8.2. Password Hashing

Senhas são sempre hasheadas com bcrypt antes de salvar no banco.

```typescript
const hashedPassword = await this.passwordHasher.hash(password);
```

**Configuração:**
- Rounds: 10 (configurável via `BCRYPT_SALT_ROUNDS`)
- Nunca armazenar senhas em plain text
- Sempre retornar `SafeUserEntity` (sem password)

### 8.3. Rate Limiting

O projeto implementa rate limiting global e específico para autenticação.

**Configuração:**

```typescript
// Global (todas as rotas)
THROTTLE_TTL=60        # Janela de 60 segundos
THROTTLE_LIMIT=100     # Máximo 100 requests

// Autenticação (mais restritivo)
AUTH_THROTTLE_TTL=60
AUTH_THROTTLE_LIMIT=5  # Máximo 5 tentativas de login
```

**Saltando rate limiting:**

```typescript
@SkipThrottle({ default: true })
@Get('public-endpoint')
publicRoute() { }
```

### 8.4. CORS

CORS é configurável via variável de ambiente:

```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3001
```

**Configuração no `main.ts`:**

```typescript
app.enableCors({
  origin: corsOrigins,
  credentials: true,
});
```

### 8.5. Validation Pipe

Validação automática de DTOs está habilitada globalmente:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,          // Remove propriedades não decoradas
    forbidNonWhitelisted: true, // Lança erro se propriedade extra
    transform: true,            // Transforma tipos automaticamente
  }),
);
```

---

## 9. Testes

### 9.1. Estratégia de Testes

O projeto implementa dois tipos de testes:

#### Testes Unitários
- **Localização:** `test/unit/`
- **Alvo:** Use Cases
- **Abordagem:** Mockear repositórios e dependências
- **Comando:** `npm test`

#### Testes E2E
- **Localização:** `test/e2e/`
- **Alvo:** API completa (controllers → use cases → banco)
- **Abordagem:** Banco de dados real
- **Comando:** `npm run test:e2e`

### 9.2. Testes Unitários

#### Estrutura

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;

  const mockUsersRepository = {
    emailExists: jest.fn(),
    create: jest.fn(),
  };

  const mockPasswordHasher = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: 'UsersRepository', useValue: mockUsersRepository },
        { provide: 'PasswordHasher', useValue: mockPasswordHasher },
      ],
    }).compile();

    useCase = module.get(CreateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create user successfully', async () => {
    // Arrange
    mockUsersRepository.emailExists.mockResolvedValue(false);
    mockPasswordHasher.hash.mockResolvedValue('hashed');
    mockUsersRepository.create.mockResolvedValue({
      id: '1',
      name: 'John',
      email: 'john@test.com',
    });

    // Act
    const result = await useCase.execute({
      name: 'John',
      email: 'john@test.com',
      password: '123456',
    });

    // Assert
    expect(mockUsersRepository.emailExists).toHaveBeenCalledWith('john@test.com');
    expect(mockPasswordHasher.hash).toHaveBeenCalled();
    expect(result).not.toHaveProperty('password');
  });
});
```

**Executar:**
```bash
# Rodar todos os testes unitários
docker-compose exec server npm test

# Modo watch
docker-compose exec server npm run test:watch

# Com cobertura
docker-compose exec server npm run test:cov
```

**Princípios:**
- Usar padrão AAA (Arrange-Act-Assert)
- Mockear todas as dependências
- Testar casos de sucesso e erro
- Verificar que senha não é retornada

### 9.3. Testes E2E

#### Configuração do Banco de Testes

Os testes E2E requerem um banco de dados PostgreSQL separado.

**1. Criar banco de testes:**

```bash
# Criar banco de testes no PostgreSQL
docker-compose exec postgres psql -U user -d boilerplate_db -c "CREATE DATABASE boilerplate_test;"
```

**2. Configurar `.env.test`:**

```bash
# Use 'postgres' como host (nome do serviço Docker)
DATABASE_URL=postgresql://user:password@postgres:5432/boilerplate_test
```

**3. Rodar migrations:**

```bash
# Executar migrations no banco de testes
docker-compose exec server sh -c "DATABASE_URL='postgresql://user:password@postgres:5432/boilerplate_test' npx prisma migrate deploy"
```

**4. Rodar testes:**

```bash
docker-compose exec server npm run test:e2e
```

#### Estrutura de Teste E2E

```typescript
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './setup';
import { resetDatabase } from '@test/utils/reset-db';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(); // Limpa banco antes de cada teste
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users - should create user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        name: 'John Doe',
        email: 'john@test.com',
        password: '12345678',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).not.toHaveProperty('password');
  });
});
```

**Princípios:**
- Limpar banco antes de cada teste (`resetDatabase()`)
- Testar fluxo completo (request → response)
- Verificar status HTTP e estrutura de resposta
- Testar casos de sucesso e erro

### 9.4. CI/CD Pipeline

O projeto inclui um pipeline completo de CI/CD usando GitHub Actions.

#### Configuração

Arquivo: [.github/workflows/ci.yml](.github/workflows/ci.yml)

**Triggers:**
- Push para `main` ou `develop`
- Pull Requests para `main` ou `develop`

**Jobs:**

1. **Lint**
   - Executa ESLint
   - Verifica padrões de código

2. **Build**
   - Compila TypeScript
   - Gera Prisma Client
   - Verifica build

3. **Unit Tests**
   - Executa testes unitários
   - Usa mocks (sem banco)

4. **E2E Tests**
   - Sobe PostgreSQL 16 em container
   - Executa migrations
   - Roda testes E2E completos

**Variáveis de Ambiente (E2E):**
```yaml
DATABASE_URL: postgresql://user:password@localhost:5432/boilerplate_test
NODE_ENV: test
JWT_ACCESS_SECRET: test-secret-key-access-token-very-secure
JWT_REFRESH_SECRET: test-secret-key-refresh-token-very-secure
```

**Todos os jobs devem passar** para o PR poder ser mergeado.

#### Badge de Status

Adicione no README:
```markdown
[![CI](https://github.com/seu-usuario/nestjs-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/nestjs-boilerplate/actions/workflows/ci.yml)
```

### 9.5. Scripts de Teste

```bash
# Testes unitários
docker-compose exec server npm test                # Rodar todos os testes unitários
docker-compose exec server npm run test:watch      # Modo watch
docker-compose exec server npm run test:cov        # Com cobertura

# Testes E2E
docker-compose exec server npm run test:e2e        # Rodar testes E2E
```

---

## 10. API Reference

### 10.1. Formato de Resposta

Todas as respostas seguem o formato padrão:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-18T10:30:00.000Z"
}
```

### 10.2. Autenticação

#### POST /api/v1/auth/register

Registrar novo usuário.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "USER"
    }
  }
}
```

#### POST /api/v1/auth/login

Fazer login.

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (200):** Igual ao register.

#### POST /api/v1/auth/refresh

Renovar access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

#### POST /api/v1/auth/logout

Fazer logout (requer autenticação).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204):** No content.

### 10.3. Usuários

Todos os endpoints de usuários requerem autenticação.

#### POST /api/v1/users

Criar usuário (somente ADMIN).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "senha123",
  "role": "USER"
}
```

**Response (201):** Dados do usuário (sem senha).

#### GET /api/v1/users

Listar usuários com paginação (somente ADMIN).

**Query Parameters:**
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 10, max: 100)
- `search` (optional): Busca por nome ou email
- `sortBy` (optional): Campo para ordenação (default: createdAt)
- `order` (optional): ASC ou DESC (default: DESC)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@example.com",
        "role": "USER",
        "isActive": true,
        "createdAt": "2026-02-18T10:30:00.000Z",
        "updatedAt": "2026-02-18T10:30:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

#### GET /api/v1/users/:id

Buscar usuário por ID (ADMIN ou proprietário).

**Response (200):** Dados do usuário (sem senha).

#### PATCH /api/v1/users/:id

Atualizar usuário (ADMIN ou proprietário).

**Request:**
```json
{
  "name": "João da Silva",
  "email": "joao.novo@example.com"
}
```

**Response (200):** Dados atualizados do usuário.

#### DELETE /api/v1/users/:id

Deletar usuário (soft delete, somente ADMIN).

**Response (204):** No content.

### 10.4. Health Check

#### GET /api/v1/health

Verificar saúde da aplicação.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-02-18T10:30:00.000Z",
    "uptime": 3600,
    "database": "connected"
  }
}
```

### 10.5. Documentação Swagger

A documentação completa está disponível em:

```
http://localhost:3000/api/docs
```

---

## 11. Guia de Desenvolvimento

> 🐳 **Nota:** Todos os comandos de desenvolvimento devem ser executados dentro do container usando `docker-compose exec server <comando>` ou acessando o shell com `docker-compose exec server sh`.

### 11.1. Como Criar um Novo Módulo

Vamos criar um módulo de "Posts" como exemplo.

#### 1. Criar Estrutura de Pastas

Você pode criar a estrutura diretamente no host (seus arquivos locais) ou dentro do container:

```bash
# Opção 1: No host (recomendado - mais fácil)
mkdir -p src/modules/posts/{application/use-cases,domain/{entities,repositories},infra/repositories,dto}
touch src/modules/posts/{posts.controller.ts,posts.module.ts}

# Opção 2: Dentro do container
docker-compose exec server sh -c "mkdir -p src/modules/posts/{application/use-cases,domain/{entities,repositories},infra/repositories,dto}"
docker-compose exec server sh -c "touch src/modules/posts/{posts.controller.ts,posts.module.ts}"
```

#### 2. Definir Schema no Prisma

```prisma
// prisma/schema.prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Rodar migration:
```bash
docker-compose exec server npx prisma migrate dev --name add_posts
```

#### 3. Criar Entidade de Domínio

```typescript
// src/modules/posts/domain/entities/post.entity.ts
export interface PostEntity {
  id: string;
  title: string;
  content: string;
  authorId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4. Criar Interface do Repositório

```typescript
// src/modules/posts/domain/repositories/posts.repository.interface.ts
export interface IPostsRepository {
  findById(id: string): Promise<PostEntity | null>;
  create(data: CreatePostData): Promise<PostEntity>;
  update(id: string, data: UpdatePostData): Promise<PostEntity>;
  delete(id: string): Promise<void>;
}
```

#### 5. Implementar Repositório Prisma

```typescript
// src/modules/posts/infra/repositories/prisma-posts.repository.ts
@Injectable()
export class PrismaPostsRepository implements IPostsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<PostEntity | null> {
    return this.prisma.post.findUnique({
      where: { id, isActive: true },
    });
  }

  async create(data: CreatePostData): Promise<PostEntity> {
    return this.prisma.post.create({ data });
  }

  // ... demais métodos
}
```

#### 6. Criar DTOs

```typescript
// src/modules/posts/dto/create-post.dto.ts
export class CreatePostDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly content: string;
}
```

#### 7. Criar Use Cases

```typescript
// src/modules/posts/application/use-cases/create-post.use-case.ts
@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject('PostsRepository')
    private readonly postsRepository: IPostsRepository,
  ) {}

  async execute(authorId: string, data: CreatePostDto): Promise<PostEntity> {
    return this.postsRepository.create({
      ...data,
      authorId,
    });
  }
}
```

#### 8. Criar Controller

```typescript
// src/modules/posts/posts.controller.ts
@ApiTags('Posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private createPostUseCase: CreatePostUseCase) {}

  @Post()
  @Auditable('create', 'post')
  async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreatePostDto) {
    return this.createPostUseCase.execute(user.id, dto);
  }
}
```

#### 9. Configurar Module

```typescript
// src/modules/posts/posts.module.ts
@Module({
  imports: [DatabaseModule],
  controllers: [PostsController],
  providers: [
    {
      provide: 'PostsRepository',
      useClass: PrismaPostsRepository,
    },
    CreatePostUseCase,
  ],
})
export class PostsModule {}
```

#### 10. Importar no AppModule

```typescript
// src/app.module.ts
@Module({
  imports: [
    // ... outros módulos
    PostsModule,
  ],
})
export class AppModule {}
```

### 11.2. Convenções de Nomenclatura

#### Arquivos
- Use cases: `create-user.use-case.ts`
- Repositories: `users.repository.interface.ts` (domain), `prisma-users.repository.ts` (infra)
- DTOs: `create-user.dto.ts`
- Entities: `user.entity.ts`
- Controllers: `users.controller.ts`
- Modules: `users.module.ts`

#### Classes
- Use cases: `CreateUserUseCase`
- Repositories: `IUsersRepository` (interface), `PrismaUsersRepository` (implementação)
- Guards: `JwtAuthGuard`, `RolesGuard`
- Services: `AuthService`, `TypedConfigService`

### 11.3. Boas Práticas

#### ✅ SEMPRE Faça

1. **Criar use cases isolados** para cada operação
2. **Definir interfaces de repositórios** na camada domain
3. **Implementar repositórios** na camada infra
4. **Validar DTOs** com class-validator
5. **Documentar endpoints** com Swagger
6. **Escrever testes** para use cases e API
7. **Usar guards** para proteger rotas
8. **Limpar dados sensíveis** antes de retornar
9. **Usar soft delete** por padrão
10. **Acessar configs** via TypedConfigService

#### ❌ NUNCA Faça

1. Acessar PrismaService diretamente de use cases
2. Colocar lógica de negócio em controllers
3. Injetar implementações concretas (usar interfaces)
4. Acessar `process.env` diretamente
5. Retornar senhas em respostas
6. Fazer hard delete sem motivo
7. Criar entities Prisma na camada domain
8. Misturar lógicas de diferentes use cases

### 11.4. Comandos Úteis

```bash
# Docker - Gerenciamento do Ambiente
docker-compose up -d                          # Subir todos os serviços
docker-compose down                           # Parar todos os serviços
docker-compose down -v                        # Parar e remover volumes
docker-compose logs -f server                 # Ver logs em tempo real
docker-compose up -d --build                  # Rebuild e subir
docker-compose exec server sh                 # Acessar shell do container

# Desenvolvimento (dentro do container)
docker-compose exec server npm run start:dev  # Já roda automaticamente!
docker-compose exec server npm run build      # Build para produção

# Banco de Dados
docker-compose exec server npx prisma migrate dev --name description  # Criar migration
docker-compose exec server npx prisma migrate deploy                  # Aplicar migrations
docker-compose exec server npx prisma generate                        # Gerar Prisma Client
docker-compose exec server npx prisma studio                          # Interface visual do banco
docker-compose exec server npm run prisma db seed                     # Popular banco

# PostgreSQL CLI
docker-compose exec postgres psql -U user -d boilerplate_db           # Acessar PostgreSQL

# Testes
docker-compose exec server npm test                   # Testes unitários
docker-compose exec server npm run test:watch         # Testes em modo watch
docker-compose exec server npm run test:cov           # Testes com cobertura
docker-compose exec server npm run test:e2e           # Testes E2E

# Qualidade de Código
docker-compose exec server npm run lint               # Rodar ESLint
docker-compose exec server npm run format             # Formatar código com Prettier
```

---

## Conclusão

Este boilerplate fornece uma base sólida para construir APIs escaláveis e mantíveis com NestJS. Seguindo os padrões e convenções estabelecidos, você garante:

- **Código limpo e organizado**
- **Fácil manutenção e evolução**
- **Alta testabilidade**
- **Segurança robusta**
- **Performance otimizada**

Para dúvidas ou sugestões, consulte a [documentação oficial do NestJS](https://docs.nestjs.com/).
