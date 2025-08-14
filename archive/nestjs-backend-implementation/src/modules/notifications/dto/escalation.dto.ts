import { IsEnum, IsString, IsOptional, IsUUID, IsUrl } from 'class-validator';

export class CreateEscalationDto {
  @IsUUID()
  order_id: string;

  @IsEnum(['SLA_BREACH', 'APPROACHING_SLA', 'CRITICAL_ERROR', 'SYSTEM_ALERT'])
  alert_type: 'SLA_BREACH' | 'APPROACHING_SLA' | 'CRITICAL_ERROR' | 'SYSTEM_ALERT';

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsString()
  message: string;

  @IsOptional()
  @IsUrl()
  teams_webhook_url?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class EscalationResponseDto {
  id: string;
  order_id: string;
  alert_type: 'SLA_BREACH' | 'APPROACHING_SLA' | 'CRITICAL_ERROR' | 'SYSTEM_ALERT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'SENT' | 'RESOLVED' | 'FAILED';
  message: string;
  teams_webhook_url?: string;
  notification_sent_at?: Date;
  resolved_at?: Date;
  retry_count: number;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export class TeamsMessageDto {
  @IsString()
  title: string;

  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  sections?: TeamsMessageSectionDto[];
}

export class TeamsMessageSectionDto {
  activityTitle: string;
  activitySubtitle: string;
  facts: Array<{
    name: string;
    value: string;
  }>;
  markdown?: boolean;
}