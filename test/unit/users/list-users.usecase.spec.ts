import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from '@modules/users/application/use-cases';
import { UserRole } from '@prisma/client';
import { UserSortBy } from '@modules/users/dto';
import { SortOrder } from '@common/pagination';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;

  const mockUsersRepository = {
    paginate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersUseCase,
        {
          provide: 'UsersRepository',
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list users with pagination', async () => {
    // Arrange
    const queryDto = {
      page: 1,
      limit: 10,
      sortBy: UserSortBy.CREATED_AT,
      order: SortOrder.DESC,
    };

    const mockUsers = [
      {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        password: 'hashed-password-1',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'User 2',
        email: 'user2@example.com',
        password: 'hashed-password-2',
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockPaginatedResponse = {
      items: mockUsers,
      meta: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    };

    mockUsersRepository.paginate.mockResolvedValue(mockPaginatedResponse);

    // Act
    const result = await useCase.execute(queryDto);

    // Assert
    expect(mockUsersRepository.paginate).toHaveBeenCalledWith({
      page: queryDto.page,
      limit: queryDto.limit,
      sortBy: queryDto.sortBy,
      order: queryDto.order,
      search: undefined,
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).not.toHaveProperty('password');
    expect(result.items[1]).not.toHaveProperty('password');
    expect(result.meta).toEqual(mockPaginatedResponse.meta);
  });

  it('should use default pagination values', async () => {
    // Arrange
    const queryDto = {};

    const mockPaginatedResponse = {
      items: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    mockUsersRepository.paginate.mockResolvedValue(mockPaginatedResponse);

    // Act
    await useCase.execute(queryDto);

    // Assert
    expect(mockUsersRepository.paginate).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sortBy: undefined,
      order: undefined,
      search: undefined,
    });
  });

  it('should support search functionality', async () => {
    // Arrange
    const queryDto = {
      page: 1,
      limit: 10,
      search: 'john',
    };

    const mockUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockPaginatedResponse = {
      items: mockUsers,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    mockUsersRepository.paginate.mockResolvedValue(mockPaginatedResponse);

    // Act
    const result = await useCase.execute(queryDto);

    // Assert
    expect(mockUsersRepository.paginate).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sortBy: undefined,
      order: undefined,
      search: 'john',
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('John Doe');
  });

  it('should return empty list when no users found', async () => {
    // Arrange
    const queryDto = {
      page: 1,
      limit: 10,
    };

    const mockPaginatedResponse = {
      items: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    mockUsersRepository.paginate.mockResolvedValue(mockPaginatedResponse);

    // Act
    const result = await useCase.execute(queryDto);

    // Assert
    expect(result.items).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });
});
