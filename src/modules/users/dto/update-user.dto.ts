import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Endereço de email do usuário',
    example: 'joao.silva@exemplo.com',
  })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional({
    description: 'Senha do usuário (mínimo 8 caracteres)',
    example: 'NovaSenhaSegura123',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  readonly password?: string;

  @ApiPropertyOptional({
    description: 'Papel do usuário no sistema',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;

  @ApiPropertyOptional({
    description: 'Status ativo do usuário',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
