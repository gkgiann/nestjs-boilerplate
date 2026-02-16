import { DomainException } from '@core/exceptions';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsError extends DomainException {
  constructor() {
    super('Email or password is incorrect', HttpStatus.UNAUTHORIZED);
  }
}
