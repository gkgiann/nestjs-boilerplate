import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { UsersRepository } from '@modules/users/infra/repositories';
import { UpdateUserDto } from '@modules/users/dto';
import { SafeUserEntity } from '@modules/users/domain/entities/user.entity';

/**
 * Caso de Uso: Atualizar Usuário
 * Lógica de negócio para atualizar um usuário existente
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
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
      updateData.password = await this.authService.hashPassword(data.password);
    }

    // 4. Atualizar usuário
    const updatedUser = await this.usersRepository.update(id, updateData);

    // 5. Retornar usuário sem a senha
    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }
}
