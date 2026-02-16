import { PaginatedResponse } from './paginated-response.interface';
import { SortOrder } from './pagination-query.dto';

/**
 * Interface de opções de paginação
 */
export interface PaginateOptions {
  page: number;
  limit: number;
  sortBy?: string;
  order?: SortOrder;
}

/**
 * Função utilitária genérica de paginação para modelos Prisma
 *
 * @template T - O tipo dos itens sendo paginados
 * @param model - Delegate do modelo Prisma (ex: prisma.user)
 * @param options - Opções de paginação (page, limit, sortBy, order)
 * @param where - Cláusula where do Prisma opcional para filtragem
 * @param select - Cláusula select do Prisma opcional para seleção de campos
 * @returns Resposta paginada com itens e metadados
 *
 * @example
 * ```typescript
 * const result = await paginate(
 *   this.prisma.user,
 *   { page: 1, limit: 10, sortBy: 'createdAt', order: SortOrder.DESC },
 *   { isActive: true },
 *   { id: true, name: true, email: true }
 * );
 * ```
 */
export async function paginate<T>(
  model: any,
  options: PaginateOptions,
  where?: any,
  select?: any,
): Promise<PaginatedResponse<T>> {
  const { page, limit, sortBy = 'createdAt', order = SortOrder.DESC } = options;

  // Calcular offsets de paginação
  const skip = (page - 1) * limit;
  const take = limit;

  // Construir cláusula orderBy
  const orderBy = sortBy ? { [sortBy]: order } : undefined;

  // Construir opções de query
  const queryOptions: any = {
    skip,
    take,
    where,
    orderBy,
  };

  // Adicionar select se fornecido
  if (select) {
    queryOptions.select = select;
  }

  // Executar queries em paralelo para melhor performance
  const [items, total] = await Promise.all([model.findMany(queryOptions), model.count({ where })]);

  // Calcular total de páginas
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Utilitário de paginação com suporte a busca
 * Estende a função base de paginação com funcionalidade de busca
 *
 * @template T - O tipo dos itens sendo paginados
 * @param model - Delegate do modelo Prisma
 * @param options - Opções de paginação com busca opcional
 * @param searchFields - Array com nomes dos campos para buscar
 * @param baseWhere - Cláusula where base opcional para combinar com busca
 * @param select - Cláusula select do Prisma opcional
 * @returns Resposta paginada com itens e metadados
 *
 * @example
 * ```typescript
 * const result = await paginateWithSearch(
 *   this.prisma.user,
 *   { page: 1, limit: 10, search: 'john' },
 *   ['name', 'email'],
 *   { isActive: true }
 * );
 * ```
 */
export async function paginateWithSearch<T>(
  model: any,
  options: PaginateOptions & { search?: string },
  searchFields: string[],
  baseWhere?: any,
  select?: any,
): Promise<PaginatedResponse<T>> {
  const { search, ...paginateOptions } = options;

  // Construir cláusula where com busca
  let where = baseWhere || {};

  if (search && searchFields.length > 0) {
    const searchConditions = searchFields.map((field) => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    }));

    where = {
      ...baseWhere,
      OR: searchConditions,
    };
  }

  return paginate<T>(model, paginateOptions, where, select);
}
