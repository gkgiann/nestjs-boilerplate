import { Inject, Injectable } from '@nestjs/common';
import { ListUsersDto } from '@modules/users/dto';
import { SafeUserEntity } from '@modules/users/domain/entities/user.entity';
import { PaginatedResponse } from '@common/pagination';
import { type IUsersRepository } from '@modules/users/domain/repositories/users.repository.interface';

/**
 * Caso de Uso: Listar Usuários
 * Lógica de negócio para listar usuários com paginação
 */
@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}
  async execute(params: ListUsersDto): Promise<PaginatedResponse<SafeUserEntity>> {
    // 1. Obter usuários paginados do repositório
    const result = await this.usersRepository.paginate({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortBy: params.sortBy,
      order: params.order,
      search: params.search,
    });

    // 2. Remover senha de todos os usuários
    const safeItems = result.items.map((user) => {
      const { password: _password, ...safeUser } = user;
      return safeUser;
    });

    // 3. Retornar resultado paginado sem senhas
    return {
      items: safeItems,
      meta: result.meta,
    };
  }
}
