import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PasswordHasher } from './password-hasher.interface';

/**
 * Implementação de PasswordHasher usando bcrypt
 * Utiliza ConfigService para obter o número de rounds de salt
 */
@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Fazer hash de uma senha usando bcrypt
   */
  async hash(password: string): Promise<string> {
    const rounds = this.configService.get<number>('security.bcryptSaltRounds') ?? 12;
    return bcrypt.hash(password, rounds);
  }

  /**
   * Comparar uma senha em texto plano com um hash bcrypt
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
