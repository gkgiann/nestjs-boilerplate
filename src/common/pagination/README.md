# Pagination - Guia de uso

## 📋 Visão Geral

Este módulo fornece uma estrutura padronizada e reutilizável para implementar paginação em todos os recursos da API. Ele inclui DTOs, interfaces, e funções utilitárias que simplificam a implementação de listagens paginadas.

## 📁 Estrutura

```
src/common/pagination/
├── index.ts                          # Barrel export
├── pagination-query.dto.ts           # DTO base para queries paginadas
├── pagination-meta.interface.ts      # Interface para metadados de paginação
├── paginated-response.interface.ts   # Interface genérica de resposta paginada
└── paginate.util.ts                 # Funções utilitárias de paginação
```

## 🚀 Como Usar

### 1. No DTO da Feature

Estenda `PaginationQueryDto` e adicione apenas os campos específicos da sua feature:

```typescript
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@common/pagination';

export enum ProductSortBy {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
}

export class ListProductsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    enum: ProductSortBy,
    default: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  readonly sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Filtrar por categoria',
  })
  @IsOptional()
  readonly category?: string;
}
```

### 2. No Repository

Use a função `paginate` ou `paginateWithSearch`:

#### Opção A: Paginação Simples

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { PaginatedResponse, paginate } from '@common/pagination';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    return paginate<Product>(
      this.prisma.product,
      params,
      { isActive: true }, // where clause (opcional)
      { id: true, name: true, price: true } // select clause (opcional)
    );
  }
}
```

#### Opção B: Paginação com Busca

```typescript
import { paginateWithSearch } from '@common/pagination';

async paginate(params: PaginationParams): Promise<PaginatedResponse<Product>> {
  return paginateWithSearch<Product>(
    this.prisma.product,
    params,
    ['name', 'description'], // campos para buscar
    { isActive: true }, // where base (opcional)
    { id: true, name: true, price: true } // select (opcional)
  );
}
```

### 3. No Use Case

```typescript
import { Injectable } from '@nestjs/common';
import { PaginatedResponse } from '@common/pagination';

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly repository: ProductsRepository) {}

  async execute(params: ListProductsDto): Promise<PaginatedResponse<SafeProduct>> {
    const result = await this.repository.paginate({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortBy: params.sortBy,
      order: params.order,
      search: params.search,
    });

    // Transforme os dados se necessário
    const items = result.items.map(item => ({
      ...item,
      price: Number(item.price), // exemplo de transformação
    }));

    return {
      items,
      meta: result.meta,
    };
  }
}
```

### 4. No Controller

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly listProducts: ListProductsUseCase) {}

  @Get()
  @ApiOkResponse({
    description: 'Lista paginada de produtos',
  })
  async list(@Query() query: ListProductsDto) {
    return this.listProducts.execute(query);
  }
}
```

## 📝 Interfaces

### PaginationQueryDto

DTO base que fornece:
- `page?: number` - Número da página (padrão: 1, mínimo: 1)
- `limit?: number` - Itens por página (padrão: 10, mínimo: 1, máximo: 100)
- `order?: SortOrder` - Ordem de classificação ('asc' ou 'desc', padrão: 'desc')

### PaginatedResponse<T>

Interface genérica de resposta:

```typescript
interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## 🔧 Funções Utilitárias

### `paginate<T>`

Função genérica para paginação simples.

**Parâmetros:**
- `model` - Delegate do Prisma (ex: `prisma.product`)
- `options` - Opções de paginação (page, limit, sortBy, order)
- `where?` - Cláusula where do Prisma (opcional)
- `select?` - Cláusula select do Prisma (opcional)

**Retorno:** `Promise<PaginatedResponse<T>>`

### `paginateWithSearch<T>`

Função para paginação com busca textual.

**Parâmetros:**
- `model` - Delegate do Prisma
- `options` - Opções de paginação + campo `search` (opcional)
- `searchFields` - Array de campos para buscar
- `baseWhere?` - Cláusula where base (opcional)
- `select?` - Cláusula select (opcional)

**Retorno:** `Promise<PaginatedResponse<T>>`

## ✅ Exemplo Completo

Veja o módulo `users` para um exemplo completo de implementação:
- `/src/modules/users/dto/list-users.dto.ts` - DTO
- `/src/modules/users/infra/repositories/users.repository.ts` - Repository
- `/src/modules/users/application/use-cases/list-users.use-case.ts` - Use Case
- `/src/modules/users/users.controller.ts` - Controller

## 📊 Resposta da API

Exemplo de resposta:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Produto 1",
        "price": 99.90
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Boas Práticas

1. **Sempre estenda `PaginationQueryDto`** ao criar DTOs de listagem
2. **Use `paginateWithSearch`** quando precisar de busca textual
3. **Adicione validação específica** nos enums de ordenação
4. **Transforme dados sensíveis** no Use Case antes de retornar
5. **Configure limites apropriados** para evitar sobrecarga (máximo padrão: 100)
6. **Use select** no Prisma para retornar apenas os campos necessários
7. **Use defaults** (`??`) no Use Case para valores opcionais

## 🔒 Segurança

- Limite máximo de 100 itens por página
- Validação automática de tipos e valores
- Sanitização de inputs via class-validator
- Suporte a soft deletes (configure no where clause)

---

**Dúvidas?** Consulte a implementação no módulo `users` ou a documentação do Prisma.
