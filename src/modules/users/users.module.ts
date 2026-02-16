import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersController } from './users.controller';

// Use Cases
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  ListUsersUseCase,
} from './application/use-cases';

// Repositories
import { UsersRepository } from './infra/repositories';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UsersController],
  providers: [
    // Repository
    UsersRepository,

    // Use Cases
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
  ],
  exports: [
    // Export repository for use in other modules
    UsersRepository,
  ],
})
export class UsersModule {}
