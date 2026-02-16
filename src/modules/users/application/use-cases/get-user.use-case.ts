import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SafeUserEntity } from '@modules/users/domain/entities/user.entity';
import { type IUsersRepository } from '@modules/users/domain/repositories/users.repository.interface';

/**
 * Caso de Uso: Buscar Usuário
 * Lógica de negócio para buscar um único usuário por ID
 */
@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(id: string): Promise<SafeUserEntity> {
    // 1. Buscar usuário por ID
    const user = await this.usersRepository.findById(id);

    // 2. Verificar se o usuário existe
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Retornar usuário sem a senha
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
