import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase } from '@modules/auth/application/use-cases';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  const mockRefreshTokenRepository = {
    revokeAllByUserId: jest.fn(),
    revokeByTokenHash: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        {
          provide: 'RefreshTokenRepository',
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should logout user from all devices', async () => {
    // Arrange
    const userId = '123';
    mockRefreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId);

    // Assert
    expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(userId);
  });

  it('should logout user from specific device', async () => {
    // Arrange
    const userId = '123';
    const tokenHash = 'token-hash-123';
    mockRefreshTokenRepository.revokeByTokenHash.mockResolvedValue(undefined);

    // Act
    await useCase.executeFromDevice(userId, tokenHash);

    // Assert
    expect(mockRefreshTokenRepository.revokeByTokenHash).toHaveBeenCalledWith(tokenHash);
  });

  it('should handle logout when no tokens exist', async () => {
    // Arrange
    const userId = '123';
    mockRefreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId);

    // Assert
    expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(userId);
    // Should not throw error even if no tokens exist
  });
});
