import { DomainException } from '@core/exceptions';
import { HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsError extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists`, HttpStatus.CONFLICT);
  }
}
