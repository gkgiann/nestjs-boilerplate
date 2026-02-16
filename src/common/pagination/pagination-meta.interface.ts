/**
 * Pagination metadata interface
 * Contains information about the current page and total results
 */
export interface PaginationMeta {
  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Total number of items across all pages
   */
  total: number;

  /**
   * Total number of pages available
   */
  totalPages: number;
}
