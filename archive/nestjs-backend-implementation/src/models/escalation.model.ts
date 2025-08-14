import { Table, Column, Model, DataType, PrimaryKey, Default, CreatedAt, UpdatedAt } from 'sequelize-typescript';

export interface EscalationAttributes {
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
}

@Table({
  tableName: 'escalations',
  timestamps: true,
})
export class Escalation extends Model<EscalationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  order_id: string;

  @Column({
    type: DataType.ENUM('SLA_BREACH', 'APPROACHING_SLA', 'CRITICAL_ERROR', 'SYSTEM_ALERT'),
    allowNull: false,
  })
  alert_type: 'SLA_BREACH' | 'APPROACHING_SLA' | 'CRITICAL_ERROR' | 'SYSTEM_ALERT';

  @Column({
    type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'MEDIUM',
  })
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @Column({
    type: DataType.ENUM('PENDING', 'SENT', 'RESOLVED', 'FAILED'),
    allowNull: false,
    defaultValue: 'PENDING',
  })
  status: 'PENDING' | 'SENT' | 'RESOLVED' | 'FAILED';

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message: string;

  @Column(DataType.STRING)
  teams_webhook_url: string;

  @Column(DataType.DATE)
  notification_sent_at: Date;

  @Column(DataType.DATE)
  resolved_at: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  retry_count: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata: Record<string, any>;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}