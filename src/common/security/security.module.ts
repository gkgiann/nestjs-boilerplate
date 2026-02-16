import { Module } from '@nestjs/common';
import { BcryptPasswordHasher } from './bcrypt-password-hasher.service';

/**
 * Módulo de Segurança
 * Fornece abstrações para operações de segurança como hash de senha
 */
@Module({
  providers: [
    {
      provide: 'PasswordHasher',
      useClass: BcryptPasswordHasher,
    },
  ],
  exports: ['PasswordHasher'],
})
export class SecurityModule {}
