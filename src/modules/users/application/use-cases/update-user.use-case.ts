import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { type PasswordHasher } from '@common/security';
import { UpdateUserDto } from '@modules/users/dto';
import { SafeUserEntity } from '@modules/users/domain/entities/user.entity';
import { type IUsersRepository } from '@modules/users/domain/repositories/users.repository.interface';

/**
 * Caso de Uso: Atualizar Usuário
 * Lógica de negócio para atualizar um usuário existente
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(id: string, data: UpdateUserDto): Promise<SafeUserEntity> {
    // 1. Verificar se o usuário existe
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Se o email está sendo atualizado, verificar se já está em uso
    if (data.email && data.email !== user.email) {
      const emailExists = await this.usersRepository.emailExists(data.email, id);

      if (emailExists) {
        throw new ConflictException('Email already in use by another user');
      }
    }

    // 3. Fazer hash da senha se estiver sendo atualizada
    const updateData = { ...data };
    if (data.password) {
      updateData.password = await this.passwordHasher.hash(data.password);
    }

    // 4. Atualizar usuário
    const updatedUser = await this.usersRepository.update(id, updateData);

    // 5. Retornar usuário sem a senha
    const { password: _, ...safeUser } = updatedUser;
    return safeUser;
  }
}
