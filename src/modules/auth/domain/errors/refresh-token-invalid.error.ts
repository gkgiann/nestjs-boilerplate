import { DomainException } from '@core/exceptions';
import { HttpStatus } from '@nestjs/common';

export class RefreshTokenInvalidError extends DomainException {
  constructor() {
    super('Refresh token is invalid or expired', HttpStatus.UNAUTHORIZED);
  }
}
