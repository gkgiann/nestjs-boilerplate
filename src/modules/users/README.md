# Users Module 👥

Complete CRUD module for user management following Clean Architecture and DDD principles.

## ✅ Implemented Features

- ✅ Create User (ADMIN only)
- ✅ List Users with pagination (ADMIN only)
- ✅ Get User by ID (ADMIN or owner)
- ✅ Update User (ADMIN or owner)
- ✅ Delete User - soft delete (ADMIN only)
- ✅ Role-Based Access Control (RBAC)
- ✅ Password hashing
- ✅ Email uniqueness validation
- ✅ Pagination with search and sorting
- ✅ Never exposes password field

---

## 📁 Architecture

```
modules/users/
├── application/
│   └── use-cases/              # Business logic
│       ├── create-user.use-case.ts
│       ├── update-user.use-case.ts
│       ├── delete-user.use-case.ts
│       ├── get-user.use-case.ts
│       └── list-users.use-case.ts
│
├── domain/
│   └── entities/               # Domain models
│       └── user.entity.ts
│
├── infra/
│   └── repositories/           # Data access layer
│       └── users.repository.ts
│
├── dto/                        # Data transfer objects
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── list-users.dto.ts
│
├── users.controller.ts         # HTTP layer
└── users.module.ts             # Module definition
```

---

## 📡 API Endpoints

### POST /api/v1/users
Create a new user (ADMIN only)

**Request:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "role": "USER"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER",
    "isActive": true,
    "createdAt": "2026-02-15T10:30:00.000Z",
    "updatedAt": "2026-02-15T10:30:00.000Z"
  },
  "timestamp": "2026-02-15T10:30:00.000Z"
}
```

---

### GET /api/v1/users
List all users with pagination (ADMIN only)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field: name | email | createdAt | updatedAt (default: createdAt)
- `order` - Sort order: asc | desc (default: desc)
- `search` - Search by name or email

**Example:**
```
GET /api/v1/users?page=1&limit=10&sortBy=createdAt&order=desc&search=john
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "USER",
        "isActive": true,
        "createdAt": "2026-02-15T10:30:00.000Z",
        "updatedAt": "2026-02-15T10:30:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  },
  "timestamp": "2026-02-15T10:30:00.000Z"
}
```

---

### GET /api/v1/users/:id
Get user by ID (ADMIN or owner)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER",
    "isActive": true,
    "createdAt": "2026-02-15T10:30:00.000Z",
    "updatedAt": "2026-02-15T10:30:00.000Z"
  },
  "timestamp": "2026-02-15T10:30:00.000Z"
}
```

**Errors:**
- `404 Not Found` - User not found
- `403 Forbidden` - Can only view own profile (non-admin)

---

### PATCH /api/v1/users/:id
Update user (ADMIN or owner)

**Request:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "password": "NewPassword123",
  "role": "ADMIN",
  "isActive": false
}
```

All fields are optional.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "ADMIN",
    "isActive": false,
    "createdAt": "2026-02-15T10:30:00.000Z",
    "updatedAt": "2026-02-15T10:35:00.000Z"
  },
  "timestamp": "2026-02-15T10:35:00.000Z"
}
```

**Errors:**
- `404 Not Found` - User not found
- `409 Conflict` - Email already in use
- `403 Forbidden` - Can only update own profile (non-admin)
- `403 Forbidden` - Cannot change own role (non-admin)

---

### DELETE /api/v1/users/:id
Delete user (ADMIN only) - Soft delete

**Response (204 No Content)**

**Errors:**
- `404 Not Found` - User not found

**Note:** This is a soft delete (sets `isActive = false`). User data is preserved.

---

## 🔒 Authorization Rules

| Endpoint | Permission |
|----------|------------|
| POST /users | ADMIN only |
| GET /users | ADMIN only |
| GET /users/:id | ADMIN or owner |
| PATCH /users/:id | ADMIN or owner* |
| DELETE /users/:id | ADMIN only |

*Non-admin users cannot change their own role.

---

## 🔐 Security Features

### Password Handling
- Automatically hashed using bcrypt before storing
- Never returned in API responses
- Minimum 8 characters required

### Email Validation
- Must be unique across all users
- Validated on create and update
- Case-insensitive search

### Soft Delete
- Users are deactivated (isActive = false) instead of deleted
- Preserves audit trail and relationships
- Can be reactivated by ADMIN

---

## 📄 DTOs

### CreateUserDto
```typescript
{
  name: string;          // Required
  email: string;         // Required, unique, valid email
  password: string;      // Required, min 8 chars
  role?: UserRole;       // Optional, default: USER
}
```

### UpdateUserDto
```typescript
{
  name?: string;
  email?: string;        // Must be unique
  password?: string;     // Min 8 chars, will be hashed
  role?: UserRole;       // ADMIN only
  isActive?: boolean;    // ADMIN only
}
```

### ListUsersDto (Query)
```typescript
{
  page?: number;         // Default: 1, min: 1
  limit?: number;        // Default: 10, min: 1, max: 100
  sortBy?: UserSortBy;   // Default: createdAt
  order?: SortOrder;     // Default: desc
  search?: string;       // Search name or email
}
```

---

## 🧩 Repository Methods

```typescript
findById(id: string): Promise<UserEntity | null>
findByEmail(email: string): Promise<UserEntity | null>
create(data: CreateUserData): Promise<UserEntity>
update(id: string, data: UpdateUserData): Promise<UserEntity>
delete(id: string): Promise<void>  // Soft delete
hardDelete(id: string): Promise<void>  // Permanent delete
paginate(params: PaginationParams): Promise<PaginatedResult<UserEntity>>
count(): Promise<number>
emailExists(email: string, excludeId?: string): Promise<boolean>
```

---

## 🧪 Testing Examples

### Create User (ADMIN)
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "SecurePass123"
  }'
```

### List Users with Pagination
```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10&search=john" \
  -H "Authorization: Bearer <admin-token>"
```

### Update Own Profile
```bash
curl -X PATCH http://localhost:3000/api/v1/users/<user-id> \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

---

## 💡 Best Practices Implemented

1. ✅ **Separation of Concerns**: Controller → Use Case → Repository
2. ✅ **Single Responsibility**: Each use case handles one operation
3. ✅ **Dependency Injection**: All dependencies injected via constructor
4. ✅ **DTO Validation**: Strong validation with class-validator
5. ✅ **Never Expose Passwords**: Removed from all responses
6. ✅ **Pagination Standard**: Consistent meta object across all list endpoints
7. ✅ **RBAC**: Role-based access control on all endpoints
8. ✅ **Error Handling**: Proper HTTP exceptions with clear messages
9. ✅ **Clean Architecture**: Domain layer is framework-agnostic
10. ✅ **Transaction Safety**: Repository uses Prisma transactions where needed

---

## 🚀 Future Enhancements

- [ ] User profile image upload
- [ ] Email verification
- [ ] Password reset flow
- [ ] User activity logs
- [ ] Bulk user operations
- [ ] Export users to CSV
- [ ] Advanced filtering (by role, status, date range)
- [ ] User preferences/settings

---

This module serves as the **reference implementation** for all future CRUD modules in this boilerplate.
