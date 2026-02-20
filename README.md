# NestJS Clean Architecture Boilerplate

<div align="center">

🚀 **Boilerplate profissional de API REST com NestJS 11**

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Características](#-características) •
[Instalação](#-instalação) •
[Uso](#-uso) •
[Documentação](#-documentação) •
[Testes](#-testes)

</div>

---

## 📖 Sobre

Boilerplate de API REST construído com NestJS seguindo princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**. Pronto para servir como base sólida para aplicações escaláveis e mantíveis.

### 🎯 Características

- ✅ **Clean Architecture** com separação clara de camadas (Domain, Application, Infra, Presentation)
- ✅ **Domain-Driven Design (DDD)** com entidades de domínio e repositórios
- ✅ **Type Safety** completo com TypeScript e validação de ambiente (Zod)
- ✅ **Autenticação JWT** com Access e Refresh Tokens
- ✅ **Segurança** avançada (bcrypt, rate limiting, CORS, validation)
- ✅ **Documentação Swagger** automática e interativa
- ✅ **Logging** estruturado com Pino
- ✅ **Paginação** reutilizável e eficiente
- ✅ **Auditoria** de ações críticas
- ✅ **Testes** unitários e E2E configurados
- ✅ **CI/CD** completo com GitHub Actions
- ✅ **Docker** com PostgreSQL e PgAdmin
- ✅ **Repository Pattern** com inversão de dependências
- ✅ **Use Cases** isolados e testáveis
- ✅ **Soft Delete** por padrão

---

## 🛠️ Stack Tecnológica

- **Framework:** NestJS 11
- **Linguagem:** TypeScript 5.7
- **ORM:** Prisma 7.4
- **Banco de Dados:** PostgreSQL 16
- **Autenticação:** JWT (Access + Refresh Tokens)
- **Validação:** class-validator, class-transformer, Zod
- **Logging:** Pino
- **Documentação:** Swagger/OpenAPI
- **Testes:** Jest (Unit + E2E)
- **Segurança:** bcryptjs, @nestjs/throttler
- **CI/CD:** GitHub Actions

---

## 📋 Pré-requisitos

- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

> 💡 **Nota:** Não é necessário ter Node.js instalado localmente! Todo o desenvolvimento é feito dentro de containers Docker.

---

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone <repository-url>
cd nestjs-boilerplate
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure as variáveis obrigatórias:

```bash
# Banco de Dados (host interno do Docker)
DATABASE_URL=postgresql://user:password@postgres:5432/boilerplate_db

# JWT Secrets (IMPORTANTE: Use valores seguros em produção!)
JWT_ACCESS_SECRET=sua-chave-secreta-de-acesso-com-pelo-menos-32-caracteres
JWT_REFRESH_SECRET=sua-chave-secreta-de-refresh-com-pelo-menos-32-caracteres

# Outras configurações (ver .env.example para mais opções)
NODE_ENV=development
PORT=3000
```

> ⚠️ **IMPORTANTE:** 
> - Os secrets JWT devem ter no mínimo 32 caracteres
> - Use `postgres` como host do banco (nome do serviço no Docker)

### 3. Subir o Ambiente Completo

```bash
docker-compose up -d
```

Isso iniciará todos os serviços:
- **NestJS API** na porta 3000 (com hot-reload)
- **PostgreSQL** na porta 5432
- **PgAdmin** na porta 5050 (acesso: admin@admin.com / admin123)

As migrations são executadas automaticamente na inicialização! ✨

### 4. (Opcional) Popular o Banco com Dados Iniciais

```bash
docker-compose exec server npm run prisma db seed
```

---

## 🎮 Uso

### Desenvolvimento

O ambiente já está rodando após `docker-compose up -d`! 🎉

A API estará disponível em:
- **API:** http://localhost:3000/api/v1
- **Swagger:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/api/v1/health
- **PgAdmin:** http://localhost:5050

### Comandos Docker Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f server

# Parar todos os serviços
docker-compose down

# Rebuild da imagem (após mudanças no Dockerfile ou package.json)
docker-compose up -d --build

# Acessar o shell do container
docker-compose exec server sh
```

### Hot Reload

O projeto está configurado com **hot-reload automático**! Qualquer alteração nos arquivos TypeScript será detectada e a aplicação recarregará automaticamente.

### Executar Comandos no Container

Para executar comandos do projeto, use `docker-compose exec server`:

```bash
# Exemplos:
docker-compose exec server npm run lint
docker-compose exec server npm run format
docker-compose exec server npx prisma studio
docker-compose exec server npx prisma migrate dev
```

### Outros Comandos

```bash
# Formatar código
docker-compose exec server npm run format

# Lint
docker-compose exec server npm run lint

# Prisma Studio (interface visual do banco)
docker-compose exec server npx prisma studio

# Gerar Prisma Client
docker-compose exec server npx prisma generate
```

---

## 📚 Documentação

### Documentação Completa

Consulte [DOCS.md](DOCS.md) para documentação técnica completa, incluindo:
- Arquitetura detalhada
- Padrões de desenvolvimento
- Guia de criação de novos módulos
- API Reference completa
- Boas práticas

### Swagger/OpenAPI

A documentação interativa da API está disponível em:

```
http://localhost:3000/api/docs
```

### Endpoints Principais

#### Autenticação

```http
POST /api/v1/auth/register      # Registrar novo usuário
POST /api/v1/auth/login         # Fazer login
POST /api/v1/auth/refresh       # Renovar access token
POST /api/v1/auth/logout        # Fazer logout
```

#### Usuários (Requer Autenticação)

```http
POST   /api/v1/users            # Criar usuário (ADMIN only)
GET    /api/v1/users            # Listar usuários (ADMIN only)
GET    /api/v1/users/:id        # Buscar por ID
PATCH  /api/v1/users/:id        # Atualizar usuário
DELETE /api/v1/users/:id        # Deletar usuário (ADMIN only)
```

#### Health Check

```http
GET /api/v1/health              # Verificar saúde da aplicação
```

### Exemplo de Uso

#### 1. Registrar Usuário

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta:**
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
  },
  "timestamp": "2026-02-18T10:30:00.000Z"
}
```

#### 2. Fazer Request Autenticado

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

---

## 🧪 Testes

### Testes Unitários

Testam use cases isoladamente (com mocks). Não requerem banco de dados.

```bash
# Rodar todos os testes
docker-compose exec server npm test

# Modo watch
docker-compose exec server npm run test:watch

# Com cobertura
docker-compose exec server npm run test:cov
```

### Testes E2E

Testam a API completa dentro do ambiente Docker.

#### Configuração Inicial

**1. Criar banco de dados de testes:**

```bash
# Criar banco de testes no PostgreSQL
docker-compose exec postgres psql -U user -d boilerplate_db -c "CREATE DATABASE boilerplate_test;"
```

**2. Configurar variável de ambiente no arquivo `.env.test`:**

```bash
# Note: use 'postgres' como host (nome do serviço Docker)
DATABASE_URL=postgresql://user:password@postgres:5432/boilerplate_test
```

**3. Executar migrations no banco de testes:**

```bash
docker-compose exec server sh -c "DATABASE_URL='postgresql://user:password@postgres:5432/boilerplate_test' npx prisma migrate deploy"
```

#### Executar Testes E2E

```bash
docker-compose exec server npm run test:e2e
```

Os testes E2E irão:
1. Conectar ao banco `boilerplate_test`
2. Limpar o banco antes de cada teste (`resetDatabase()`)
3. Testar os endpoints da API completos
4. Verificar respostas e status HTTP

---

## 🔄 CI/CD

O projeto inclui um pipeline completo de CI/CD usando **GitHub Actions**.

### Pipeline Automático

O pipeline é executado automaticamente em:
- **Push** para branches `main` ou `develop`
- **Pull Requests** para `main` ou `develop`

### Jobs do Pipeline

#### 1. **Lint** 📋
- Executa ESLint
- Verifica padrões de código
- Falha se houver erros de lint

#### 2. **Build** 🔨
- Compila o projeto TypeScript
- Gera Prisma Client
- Verifica se o build está funcionando

#### 3. **Unit Tests** 🧪
- Executa todos os testes unitários
- Testa use cases com mocks
- Não requer banco de dados

#### 4. **E2E Tests** 🚀
- Sobe PostgreSQL 16 no container Docker
- Executa migrations automaticamente
- Roda testes E2E completos
- Testa a API de ponta a ponta

### Configuração

O arquivo de configuração está em [.github/workflows/ci.yml](.github/workflows/ci.yml).

**Todos os jobs precisam passar** para o PR ser aprovado.

### Status do Build

Você pode adicionar um badge de status no README:

```markdown
[![CI](https://github.com/seu-usuario/nestjs-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/nestjs-boilerplate/actions/workflows/ci.yml)
```

---

## 🏗️ Arquitetura

O projeto segue **Clean Architecture** com **DDD**:

```
src/
├── common/              # Código compartilhado (pagination, security)
├── config/              # Configurações type-safe (Zod validation)
├── core/                # Infraestrutura central (database, logger, filters)
│
└── modules/             # Módulos de negócio
    └── <module>/
        ├── application/
        │   └── use-cases/        # Lógica de negócio (casos de uso)
        ├── domain/
        │   ├── entities/         # Modelos de domínio
        │   ├── repositories/     # Contratos (interfaces)
        │   └── errors/           # Exceções de domínio
        ├── infra/
        │   └── repositories/     # Implementações (Prisma)
        ├── dto/                  # Validação de entrada/saída
        ├── guards/               # Proteção de rotas
        ├── decorators/           # Decorators customizados
        ├── <module>.controller.ts
        └── <module>.module.ts
```

### Princípios Fundamentais

1. **Separação de Responsabilidades:** Cada camada tem um propósito único
2. **Inversão de Dependências:** Use cases dependem de interfaces, não implementações
3. **Testabilidade:** Use cases são facilmente testáveis com mocks
4. **Type Safety:** TypeScript em todo o código
5. **Security First:** Segurança em todas as camadas

---

## 📦 Módulos Disponíveis

### Auth Module
- Registro de usuários
- Login com email/senha
- JWT (Access + Refresh Tokens)
- Renovação de tokens
- Logout (revogação de tokens)

### Users Module
- CRUD completo de usuários
- Listagem com paginação e busca
- Soft delete
- Controle de acesso (ADMIN ou proprietário)

### Audit Module
- Auditoria de ações críticas
- Logs estruturados em arquivos
- Captura de contexto (usuário, IP, timestamp)

### Health Module
- Health checks da aplicação
- Status do banco de dados
- Uptime e métricas

---

## 🔒 Segurança

- **JWT Authentication:** Access tokens (15min) + Refresh tokens (7d)
- **Password Hashing:** bcrypt com 10 rounds
- **Rate Limiting:** Proteção contra brute force
  - Global: 100 requests/min
  - Auth: 5 requests/min
- **CORS:** Configurável via env vars
- **Validation:** Validação automática de DTOs
- **Type Safety:** Validação de ambiente com Zod
- **Soft Delete:** Dados não são deletados permanentemente

<div align="center">

**Feito com ❤️ usando NestJS**

</div>
