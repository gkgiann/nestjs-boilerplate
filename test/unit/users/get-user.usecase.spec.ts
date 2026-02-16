import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserUseCase } from '@modules/users/application/use-cases';
import { UserRole } from '../../../generated/prisma/enums';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;

  const mockUsersRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        {
          provide: 'UsersRepository',
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserUseCase>(GetUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get user by id successfully', async () => {
    // Arrange
    const userId = '123';
    const mockUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsersRepository.findById.mockResolvedValue(mockUser);

    // Act
    const result = await useCase.execute(userId);

    // Assert
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(userId);
    expect(result).not.toHaveProperty('password');
    expect(result.id).toBe(userId);
    expect(result.email).toBe(mockUser.email);
    expect(result.name).toBe(mockUser.name);
  });

  it('should throw NotFoundException if user not found', async () => {
    // Arrange
    const userId = 'non-existent-id';
    mockUsersRepository.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(userId);
  });
});
