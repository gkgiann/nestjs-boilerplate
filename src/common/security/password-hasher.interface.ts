/**
 * Interface de abstração para hash de senhas
 * Não depende de nenhuma implementação específica
 */
export interface PasswordHasher {
  /**
   * Fazer hash de uma senha em texto plano
   * @param password - Senha em texto plano
   * @returns Hash da senha
   */
  hash(password: string): Promise<string>;

  /**
   * Comparar uma senha em texto plano com um hash
   * @param password - Senha em texto plano
   * @param hash - Hash armazenado
   * @returns true se a senha corresponder ao hash, false caso contrário
   */
  compare(password: string, hash: string): Promise<boolean>;
}
