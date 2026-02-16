import { PaginationMeta } from './pagination-meta.interface';

/**
 * Interface genérica de resposta paginada
 * @template T - O tipo dos itens na resposta
 */
export interface PaginatedResponse<T> {
  /**
   * Array de itens da página atual
   */
  items: T[];

  /**
   * Metadados de paginação
   */
  meta: PaginationMeta;
}
