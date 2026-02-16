import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateUserUseCase } from '@modules/users/application/use-cases';
import { UserRole } from '../../../generated/prisma/enums';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;

  const mockUsersRepository = {
    findById: jest.fn(),
    emailExists: jest.fn(),
    update: jest.fn(),
  };

  const mockPasswordHasher = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: 'UsersRepository',
          useValue: mockUsersRepository,
        },
        {
          provide: 'PasswordHasher',
          useValue: mockPasswordHasher,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update user successfully', async () => {
    // Arrange
    const userId = '123';
    const existingUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateDto = {
      name: 'John Updated',
      role: UserRole.ADMIN,
    };

    const updatedUser = {
      ...existingUser,
      ...updateDto,
    };

    mockUsersRepository.findById.mockResolvedValue(existingUser);
    mockUsersRepository.update.mockResolvedValue(updatedUser);

    // Act
    const result = await useCase.execute(userId, updateDto);

    // Assert
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUsersRepository.update).toHaveBeenCalledWith(userId, updateDto);
    expect(result).not.toHaveProperty('password');
    expect(result.name).toBe(updateDto.name);
    expect(result.role).toBe(updateDto.role);
  });

  it('should hash password when updating password', async () => {
    // Arrange
    const userId = '123';
    const existingUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'old-hashed-password',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateDto = {
      password: 'newPassword123',
    };

    const hashedPassword = 'new-hashed-password';

    mockUsersRepository.findById.mockResolvedValue(existingUser);
    mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
    mockUsersRepository.update.mockResolvedValue({
      ...existingUser,
      password: hashedPassword,
    });

    // Act
    await useCase.execute(userId, updateDto);

    // Assert
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(updateDto.password);
    expect(mockUsersRepository.update).toHaveBeenCalledWith(userId, {
      password: hashedPassword,
    });
  });

  it('should throw NotFoundException if user not found', async () => {
    // Arrange
    const userId = 'non-existent-id';
    mockUsersRepository.findById.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute(userId, { name: 'New Name' })).rejects.toThrow(NotFoundException);
    expect(mockUsersRepository.update).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when updating to existing email', async () => {
    // Arrange
    const userId = '123';
    const existingUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateDto = {
      email: 'existing@example.com',
    };

    mockUsersRepository.findById.mockResolvedValue(existingUser);
    mockUsersRepository.emailExists.mockResolvedValue(true);

    // Act + Assert
    await expect(useCase.execute(userId, updateDto)).rejects.toThrow(ConflictException);
    expect(mockUsersRepository.emailExists).toHaveBeenCalledWith(updateDto.email, userId);
    expect(mockUsersRepository.update).not.toHaveBeenCalled();
  });

  it('should allow updating to same email', async () => {
    // Arrange
    const userId = '123';
    const existingUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateDto = {
      email: 'john@example.com', // Same email
      name: 'John Updated',
    };

    mockUsersRepository.findById.mockResolvedValue(existingUser);
    mockUsersRepository.update.mockResolvedValue({
      ...existingUser,
      ...updateDto,
    });

    // Act
    await useCase.execute(userId, updateDto);

    // Assert
    expect(mockUsersRepository.emailExists).not.toHaveBeenCalled();
    expect(mockUsersRepository.update).toHaveBeenCalled();
  });
});
