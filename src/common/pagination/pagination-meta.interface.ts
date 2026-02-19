/**
 * Interface de metadados de paginação
 * Contém informações sobre a página atual e total de resultados
 */
export interface PaginationMeta {
  /**
   * Número da página atual
   */
  page: number;

  /**
   * Número de itens por página
   */
  limit: number;

  /**
   * Número total de itens em todas as páginas
   */
  total: number;

  /**
   * Número total de páginas disponíveis
   */
  totalPages: number;
}
