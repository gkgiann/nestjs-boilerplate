import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database';
import { SecurityModule } from '@common/security';
import { UsersController } from './users.controller';

// Casos de Uso
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  ListUsersUseCase,
} from './application/use-cases';

// Repositórios
import { UsersRepository } from './infra/repositories';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [UsersController],
  providers: [
    // Repositório
    UsersRepository,

    // Casos de Uso
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
  ],
  exports: [
    // Exportar repositório para uso em outros módulos
    UsersRepository,
  ],
})
export class UsersModule {}
