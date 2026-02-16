import { type IUsersRepository } from '@modules/users/domain/repositories/users.repository.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

/**
 * Caso de Uso: Deletar Usuário
 * Lógica de negócio para deletar um usuário (soft delete)
 */
@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // 1. Verificar se o usuário existe
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Soft delete do usuário (definir isActive = false)
    await this.usersRepository.delete(id);

    // Nota: Para hard delete, use:
    // await this.usersRepository.hardDelete(id);
  }
}
