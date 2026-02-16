import { UserRole } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';
import { PaginatedResponse, SortOrder } from '@common/pagination';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  order?: SortOrder;
  search?: string;
}

export interface IUsersRepository {
  findById(id: string): Promise<UserEntity | null>;

  findByEmail(email: string): Promise<UserEntity | null>;

  create(data: CreateUserData): Promise<UserEntity>;

  update(id: string, data: UpdateUserData): Promise<UserEntity>;

  delete(id: string): Promise<void>;

  hardDelete(id: string): Promise<void>;

  paginate(params: PaginationParams): Promise<PaginatedResponse<UserEntity>>;

  count(): Promise<number>;

  emailExists(email: string, excludeId?: string): Promise<boolean>;
}
