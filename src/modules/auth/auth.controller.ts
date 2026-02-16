import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponseDto, RefreshResponseDto } from './dto';
import {
  RegisterUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
} from './application/use-cases';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import type { CurrentUserData } from './decorators';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Usuário já existe' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @SkipThrottle({ default: true }) // Ignora limite global
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas de login' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @SkipThrottle({ default: true }) // Ignora limite global
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso',
    type: RefreshResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas de renovação' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fazer logout (revoga todos os refresh tokens)' })
  @ApiResponse({ status: 204, description: 'Logout realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async logout(@CurrentUser() user: CurrentUserData) {
    await this.logoutUseCase.execute(user.id);
  }
}
