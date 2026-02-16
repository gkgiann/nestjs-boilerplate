import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from '@modules/users/application/use-cases';
import { UserRole } from '../../../generated/prisma/enums';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;

  const mockUsersRepository = {
    emailExists: jest.fn(),
    create: jest.fn(),
  };

  const mockPasswordHasher = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
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

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create user successfully', async () => {
    // Arrange
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
      role: 'USER' as UserRole,
    };

    mockUsersRepository.emailExists.mockResolvedValue(false);
    mockPasswordHasher.hash.mockResolvedValue('hashed-password');
    mockUsersRepository.create.mockResolvedValue({
      id: '1',
      name: dto.name,
      email: dto.email,
      password: 'hashed-password',
      role: dto.role,
    });

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(mockUsersRepository.emailExists).toHaveBeenCalledWith(dto.email);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(dto.password);
    expect(mockUsersRepository.create).toHaveBeenCalled();

    expect(result).not.toHaveProperty('password');
    expect(result.email).toBe(dto.email);
  });

  it('should throw ConflictException if email already exists', async () => {
    // Arrange
    mockUsersRepository.emailExists.mockResolvedValue(true);

    // Act + Assert
    await expect(
      useCase.execute({
        name: 'John',
        email: 'john@example.com',
        password: '123',
        role: UserRole.USER,
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockUsersRepository.create).not.toHaveBeenCalled();
  });
});
