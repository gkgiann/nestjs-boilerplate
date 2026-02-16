import { UserRole } from '../../../../../generated/prisma/enums';

/**
 * Entidade de Domínio de Usuário
 * Representa um usuário na camada de domínio (independente de framework)
 */
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

/**
 * Entidade de usuário sem dados sensíveis (para respostas)
 */
export type SafeUserEntity = Omit<UserEntity, 'password'>;
