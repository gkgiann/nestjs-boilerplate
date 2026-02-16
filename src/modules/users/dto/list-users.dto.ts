import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserSortBy {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListUsersDto {
  @ApiPropertyOptional({
    description: 'Número da página',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: 'Itens por página',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    enum: UserSortBy,
    default: UserSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(UserSortBy)
  readonly sortBy?: UserSortBy = UserSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Ordem de classificação',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  readonly order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Buscar por nome ou email',
    example: 'joão',
  })
  @IsOptional()
  @IsString()
  readonly search?: string;
}
