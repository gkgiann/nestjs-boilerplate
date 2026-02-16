import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from '@modules/auth/application/use-cases';
import { AuthService } from '@modules/auth/auth.service';
import { RefreshTokenInvalidError } from '@modules/auth/domain/errors';
import { UserRole } from '@prisma/client';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  const mockUsersRepository = {
    findById: jest.fn(),
  };

  const mockAuthService = {
    hashRefreshToken: jest.fn(),
    generateTokens: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    findByTokenHash: jest.fn(),
    deleteByTokenHash: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
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
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh tokens successfully', async () => {
    // Arrange
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    const tokenHash = 'hashed-token';
    const storedToken = {
      id: '1',
      userId: '123',
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
      device: 'Chrome',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(),
    };

    const user = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      refreshTokenHash: 'new-refresh-token-hash',
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    mockAuthService.hashRefreshToken.mockResolvedValue(tokenHash);
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken);
    mockUsersRepository.findById.mockResolvedValue(user);
    mockAuthService.generateTokens.mockResolvedValue(newTokens);
    mockRefreshTokenRepository.deleteByTokenHash.mockResolvedValue(undefined);
    mockRefreshTokenRepository.create.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(refreshTokenDto);

    // Assert
    expect(mockAuthService.hashRefreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
    expect(mockRefreshTokenRepository.findByTokenHash).toHaveBeenCalledWith(tokenHash);
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(storedToken.userId);
    expect(mockAuthService.generateTokens).toHaveBeenCalledWith({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    expect(mockRefreshTokenRepository.deleteByTokenHash).toHaveBeenCalledWith(tokenHash);
    expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith({
      userId: user.id,
      tokenHash: newTokens.refreshTokenHash,
      expiresAt: newTokens.refreshTokenExpiresAt,
      device: storedToken.device,
      ipAddress: storedToken.ipAddress,
      userAgent: storedToken.userAgent,
    });

    expect(result).toEqual({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  });

  it('should throw RefreshTokenInvalidError when token not found', async () => {
    // Arrange
    const refreshTokenDto = {
      refreshToken: 'invalid-refresh-token',
    };

    const tokenHash = 'hashed-token';

    mockAuthService.hashRefreshToken.mockResolvedValue(tokenHash);
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(RefreshTokenInvalidError);
    expect(mockAuthService.hashRefreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
    expect(mockRefreshTokenRepository.findByTokenHash).toHaveBeenCalledWith(tokenHash);
    expect(mockUsersRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw RefreshTokenInvalidError when token is expired', async () => {
    // Arrange
    const refreshTokenDto = {
      refreshToken: 'expired-refresh-token',
    };

    const tokenHash = 'hashed-token';
    const expiredToken = {
      id: '1',
      userId: '123',
      tokenHash,
      expiresAt: new Date(Date.now() - 1000), // Expired
      isRevoked: false,
      device: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
    };

    mockAuthService.hashRefreshToken.mockResolvedValue(tokenHash);
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(expiredToken);
    mockRefreshTokenRepository.deleteByTokenHash.mockResolvedValue(undefined);

    // Act + Assert
    await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(RefreshTokenInvalidError);
    expect(mockRefreshTokenRepository.deleteByTokenHash).toHaveBeenCalledWith(tokenHash);
    expect(mockUsersRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw RefreshTokenInvalidError when token is revoked', async () => {
    // Arrange
    const refreshTokenDto = {
      refreshToken: 'revoked-refresh-token',
    };

    const tokenHash = 'hashed-token';
    const revokedToken = {
      id: '1',
      userId: '123',
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: true, // Revoked
      device: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
    };

    mockAuthService.hashRefreshToken.mockResolvedValue(tokenHash);
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(revokedToken);

    // Act + Assert
    await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(RefreshTokenInvalidError);
    expect(mockRefreshTokenRepository.findByTokenHash).toHaveBeenCalledWith(tokenHash);
    expect(mockUsersRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw RefreshTokenInvalidError when user not found', async () => {
    // Arrange
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    const tokenHash = 'hashed-token';
    const storedToken = {
      id: '1',
      userId: '123',
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
      device: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
    };

    mockAuthService.hashRefreshToken.mockResolvedValue(tokenHash);
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken);
    mockUsersRepository.findById.mockResolvedValue(null); // User not found

    // Act + Assert
    await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(RefreshTokenInvalidError);
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(storedToken.userId);
    expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
  });

  it('should throw RefreshTokenInvalidError when user is inactive', async () => {
    // Arrange
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    const tokenHash = 'hashed-token';
    const storedToken = {
      id: '1',
      userId: '123',
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
      device: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
    };

    const inactiveUser = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: false, // Inactive user
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthService.hashRefreshToken.mockResolvedValue(tokenHash);
    mockRefreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken);
    mockUsersRepository.findById.mockResolvedValue(inactiveUser);

    // Act + Assert
    await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(RefreshTokenInvalidError);
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(storedToken.userId);
    expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
  });
});
