import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { UserRole } from '../../../../../generated/prisma/enums';
import { UserEntity } from '@modules/users/domain/entities/user.entity';

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
  order?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Users Repository
 * Encapsulates all database operations for User entity
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserData): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || UserRole.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete user by ID (soft delete by setting isActive to false)
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete user by ID
   */
  async hardDelete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * List users with pagination and filtering
   */
  async paginate(params: PaginationParams): Promise<PaginatedResult<UserEntity>> {
    const { page, limit, sortBy = 'createdAt', order = 'desc', search } = params;

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Execute queries in parallel
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

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
   * Count total users
   */
  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return false;
    if (excludeId && user.id === excludeId) return false;

    return true;
  }
}
