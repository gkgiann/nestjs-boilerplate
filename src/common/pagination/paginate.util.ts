import { PaginatedResponse } from './paginated-response.interface';
import { SortOrder } from './pagination-query.dto';

/**
 * Pagination options interface
 */
export interface PaginateOptions {
  page: number;
  limit: number;
  sortBy?: string;
  order?: SortOrder;
}

/**
 * Generic pagination utility function for Prisma models
 *
 * @template T - The type of items being paginated
 * @param model - Prisma model delegate (e.g., prisma.user)
 * @param options - Pagination options (page, limit, sortBy, order)
 * @param where - Optional Prisma where clause for filtering
 * @param select - Optional Prisma select clause for field selection
 * @returns Paginated response with items and metadata
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

  // Calculate pagination offsets
  const skip = (page - 1) * limit;
  const take = limit;

  // Build orderBy clause
  const orderBy = sortBy ? { [sortBy]: order } : undefined;

  // Build query options
  const queryOptions: any = {
    skip,
    take,
    where,
    orderBy,
  };

  // Add select if provided
  if (select) {
    queryOptions.select = select;
  }

  // Execute queries in parallel for better performance
  const [items, total] = await Promise.all([model.findMany(queryOptions), model.count({ where })]);

  // Calculate total pages
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
 * Pagination utility with search support
 * Extends the base paginate function with search functionality
 *
 * @template T - The type of items being paginated
 * @param model - Prisma model delegate
 * @param options - Pagination options with optional search
 * @param searchFields - Array of field names to search in
 * @param baseWhere - Optional base where clause to combine with search
 * @param select - Optional Prisma select clause
 * @returns Paginated response with items and metadata
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

  // Build where clause with search
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
