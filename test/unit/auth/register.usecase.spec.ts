import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from '@modules/auth/application/use-cases';
import { AuthService } from '@modules/auth/auth.service';
import { UserAlreadyExistsError } from '@modules/auth/domain/errors';
import { UserRole } from '../../../generated/prisma/enums';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockAuthService = {
    generateTokens: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
  };

  const mockPasswordHasher = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
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

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register user successfully', async () => {
    // Arrange
    const registerDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    };

    const hashedPassword = 'hashed-password';
    const createdUser = {
      id: '123',
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
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

    mockUsersRepository.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
    mockUsersRepository.create.mockResolvedValue(createdUser);
    mockAuthService.generateTokens.mockResolvedValue(tokens);
    mockRefreshTokenRepository.create.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(registerDto);

    // Assert
    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(registerDto.password);
    expect(mockUsersRepository.create).toHaveBeenCalledWith({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: 'USER',
    });
    expect(mockAuthService.generateTokens).toHaveBeenCalledWith({
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });
    expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith({
      userId: createdUser.id,
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    expect(result).toEqual({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
    });
  });

  it('should throw UserAlreadyExistsError when email already exists', async () => {
    // Arrange
    const registerDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    };

    const existingUser = {
      id: '123',
      name: 'Existing User',
      email: registerDto.email,
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsersRepository.findByEmail.mockResolvedValue(existingUser);

    // Act + Assert
    await expect(useCase.execute(registerDto)).rejects.toThrow(UserAlreadyExistsError);
    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
    expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
    expect(mockUsersRepository.create).not.toHaveBeenCalled();
    expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
  });
});
