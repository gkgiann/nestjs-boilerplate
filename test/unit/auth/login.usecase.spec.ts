import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from '@modules/auth/application/use-cases';
import { AuthService } from '@modules/auth/auth.service';
import { InvalidCredentialsError } from '@modules/auth/domain/errors';
import { UserRole } from '@prisma/client';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
  };

  const mockAuthService = {
    generateTokens: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
  };

  const mockPasswordHasher = {
    compare: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: 'UsersRepository',
          useValue: mockUsersRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: 'RefreshTokenRepository',
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: 'PasswordHasher',
          useValue: mockPasswordHasher,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login user successfully', async () => {
    // Arrange
    const loginDto = {
      email: 'john@example.com',
      password: 'Password123',
    };

    const user = {
      id: '123',
      name: 'John Doe',
      email: loginDto.email,
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenHash: 'refresh-token-hash',
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    mockUsersRepository.findByEmail.mockResolvedValue(user);
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockAuthService.generateTokens.mockResolvedValue(tokens);
    mockRefreshTokenRepository.create.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(loginDto);

    // Assert
    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    expect(mockAuthService.generateTokens).toHaveBeenCalledWith({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith({
      userId: user.id,
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    expect(result).toEqual({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });

  it('should throw InvalidCredentialsError when user not found', async () => {
    // Arrange
    const loginDto = {
      email: 'nonexistent@example.com',
      password: 'Password123',
    };

    mockUsersRepository.findByEmail.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute(loginDto)).rejects.toThrow(InvalidCredentialsError);
    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
    expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsError when user is inactive', async () => {
    // Arrange
    const loginDto = {
      email: 'john@example.com',
      password: 'Password123',
    };

    const inactiveUser = {
      id: '123',
      name: 'John Doe',
      email: loginDto.email,
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: false, // Inactive user
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsersRepository.findByEmail.mockResolvedValue(inactiveUser);

    // Act + Assert
    await expect(useCase.execute(loginDto)).rejects.toThrow(InvalidCredentialsError);
    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
    expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsError when password is invalid', async () => {
    // Arrange
    const loginDto = {
      email: 'john@example.com',
      password: 'WrongPassword',
    };

    const user = {
      id: '123',
      name: 'John Doe',
      email: loginDto.email,
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsersRepository.findByEmail.mockResolvedValue(user);
    mockPasswordHasher.compare.mockResolvedValue(false); // Invalid password

    // Act + Assert
    await expect(useCase.execute(loginDto)).rejects.toThrow(InvalidCredentialsError);
    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
  });
});
