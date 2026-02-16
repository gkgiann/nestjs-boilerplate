import { Injectable } from '@nestjs/common';
import { UsersRepository, PaginatedResult } from '@modules/users/infra/repositories';
import { ListUsersDto } from '@modules/users/dto';
import { SafeUserEntity } from '@modules/users/domain/entities/user.entity';

/**
 * List Users Use Case
 * Business logic for listing users with pagination
 */
@Injectable()
export class ListUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(params: ListUsersDto): Promise<PaginatedResult<SafeUserEntity>> {
    // 1. Get paginated users from repository
    const result = await this.usersRepository.paginate({
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy,
      order: params.order,
      search: params.search,
    });

    // 2. Remove password from all users
    const safeItems = result.items.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    // 3. Return paginated result without passwords
    return {
      items: safeItems,
      meta: result.meta,
    };
  }
}
