import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@modules/auth/guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@modules/auth/decorators';
import type { CurrentUserData } from '@modules/auth/decorators';
import { CreateUserDto, UpdateUserDto, ListUsersDto } from './dto';
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  ListUsersUseCase,
} from './application/use-cases';

@ApiTags('Usuários')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar um novo usuário (somente ADMIN)' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já existe',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos os usuários com paginação (somente ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Usuários recuperados com sucesso',
  })
  async findAll(@Query() query: ListUsersDto) {
    return this.listUsersUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID (ADMIN ou proprietário)' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário recuperado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserData) {
    // Verificar autorização: somente ADMIN ou proprietário pode visualizar
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new ForbiddenException('Você só pode visualizar seu próprio perfil');
    }

    return this.getUserUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário por ID (ADMIN ou proprietário)' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já está em uso',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    // Verificar autorização: somente ADMIN ou proprietário pode atualizar
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new ForbiddenException('Você só pode atualizar seu próprio perfil');
    }

    // Usuários não-admin não podem alterar seu próprio papel
    if (currentUser.role !== 'ADMIN' && updateUserDto.role) {
      throw new ForbiddenException('Você não pode alterar seu próprio papel');
    }

    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário por ID (somente ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 204,
    description: 'Usuário deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async remove(@Param('id') id: string) {
    await this.deleteUserUseCase.execute(id);
  }
}
