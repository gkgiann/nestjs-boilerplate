import { UserRole } from '../../../../../generated/prisma/enums';

/**
 * User Domain Entity
 * Represents a user in the domain layer (framework-agnostic)
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
 * User entity without sensitive data (for responses)
 */
export type SafeUserEntity = Omit<UserEntity, 'password'>;
