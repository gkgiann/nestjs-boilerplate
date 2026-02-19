import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from '@modules/users/application/use-cases';
import { UserRole } from '@prisma/client';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;

  const mockUsersRepository = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: 'UsersRepository',
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user successfully', async () => {
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
    mockUsersRepository.delete.mockResolvedValue(undefined);

    // Act
    await useCase.execute(userId);

    // Assert
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUsersRepository.delete).toHaveBeenCalledWith(userId);
  });

  it('should throw NotFoundException if user not found', async () => {
    // Arrange
    const userId = 'non-existent-id';
    mockUsersRepository.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUsersRepository.delete).not.toHaveBeenCalled();
  });
});
