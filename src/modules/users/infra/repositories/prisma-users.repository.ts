import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { UserRole } from '@prisma/client';
import { UserEntity } from '@modules/users/domain/entities/user.entity';
import { PaginatedResponse, paginateWithSearch, SortOrder } from '@common/pagination';
import {
  CreateUserData,
  IUsersRepository,
  PaginationParams,
  UpdateUserData,
} from '@modules/users/domain/repositories';

/**
 * Repositório de Usuários
 * Encapsula todas as operações de banco de dados para a entidade User
 */
@Injectable()
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Buscar usuário por ID
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
   * Buscar usuário por email
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
   * Criar um novo usuário
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
   * Atualizar usuário por ID
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
   * Deletar usuário por ID (soft delete definindo isActive como false)
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Deletar permanentemente usuário por ID
   */
  async hardDelete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Listar usuários com paginação e filtros
   */
  async paginate(params: PaginationParams): Promise<PaginatedResponse<UserEntity>> {
    const select = {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    };

    return paginateWithSearch<UserEntity>(
      this.prisma.user,
      params,
      ['name', 'email'],
      undefined,
      select,
    );
  }

  /**
   * Contar total de usuários
   */
  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  /**
   * Verificar se o email existe
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
