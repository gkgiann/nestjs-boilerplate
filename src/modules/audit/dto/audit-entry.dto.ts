export interface AuditEntryDto {
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  method: string;
  path: string;
  statusCode: number;
  ip: string;
  userAgent?: string;
  requestId?: string;
  data?: Record<string, any>;
  error?: string;
}
