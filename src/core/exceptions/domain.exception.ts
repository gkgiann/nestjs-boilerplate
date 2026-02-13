import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY) {
    super(
      {
        error: 'DOMAIN_EXCEPTION',
        message,
      },
      statusCode,
    );
  }
}

export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class ResourceNotFoundException extends DomainException {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateResourceException extends DomainException {
  constructor(resource: string, field?: string) {
    const message = field
      ? `${resource} with this ${field} already exists`
      : `${resource} already exists`;
    super(message, HttpStatus.CONFLICT);
  }
}
