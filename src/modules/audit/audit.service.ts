import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { AuditEntryDto } from './dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly auditDir: string;

  constructor() {
    // Define o diretório de auditoria na raiz do projeto
    this.auditDir = join(process.cwd(), 'audit-logs');

    // Cria o diretório se não existir
    if (!existsSync(this.auditDir)) {
      mkdirSync(this.auditDir, { recursive: true });
      this.logger.log(`Diretório de auditoria criado: ${this.auditDir}`);
    }
  }

  /**
   * Registra uma entrada de auditoria em arquivo
   * Separa logs de erro (statusCode >= 400 ou com campo error) dos logs normais
   */
  async log(entry: AuditEntryDto): Promise<void> {
    try {
      // Formata a data para nome do arquivo (YYYY-MM-DD)
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      // Determina se é um log de erro
      const isError = entry.statusCode >= 400 || !!entry.error;

      // Define o nome do arquivo baseado no tipo de log
      const fileName = isError ? `audit-errors-${dateStr}.log` : `audit-${dateStr}.log`;

      const filePath = join(this.auditDir, fileName);

      // Formata a entrada como JSON linha
      const logLine =
        JSON.stringify({
          ...entry,
          timestamp: entry.timestamp.toISOString(),
        }) + '\n';

      // Adiciona ao arquivo
      appendFileSync(filePath, logLine, 'utf8');
    } catch (error) {
      this.logger.error('Erro ao registrar auditoria', error);
    }
  }

  /**
   * Registra múltiplas entradas de auditoria
   */
  async logBatch(entries: AuditEntryDto[]): Promise<void> {
    await Promise.all(entries.map((entry) => this.log(entry)));
  }
}
