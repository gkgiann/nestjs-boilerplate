import { PaginationMeta } from './pagination-meta.interface';

/**
 * Generic paginated response interface
 * @template T - The type of items in the response
 */
export interface PaginatedResponse<T> {
  /**
   * Array of items for the current page
   */
  items: T[];

  /**
   * Pagination metadata
   */
  meta: PaginationMeta;
}
