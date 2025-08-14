import { Table, Column, Model, DataType, PrimaryKey, Default, CreatedAt, UpdatedAt, HasMany } from 'sequelize-typescript';
import { OrderItem } from './order-item.model';

export interface OrderAttributes {
  id: string;
  order_no: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_date: Date;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  channel: string;
  business_unit: string;
  order_type: string;
  total_amount: number;
  shipping_street?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  payment_method: string;
  payment_status: string;
  payment_transaction_id?: string;
  sla_target_minutes: number;
  sla_elapsed_minutes: number;
  sla_status: 'BREACH' | 'NEAR_BREACH' | 'COMPLIANT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  store_name: string;
  metadata?: Record<string, any>;
}

@Table({
  tableName: 'orders',
  timestamps: true,
  paranoid: true, // Soft deletes
})
export class Order extends Model<OrderAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  order_no: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  customer_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  customer_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  customer_email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  customer_phone: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  order_date: Date;

  @Column({
    type: DataType.ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'),
    allowNull: false,
    defaultValue: 'PENDING',
  })
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  channel: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  business_unit: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'STANDARD',
  })
  order_type: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  total_amount: number;

  // Shipping Address
  @Column(DataType.STRING)
  shipping_street: string;

  @Column(DataType.STRING)
  shipping_city: string;

  @Column(DataType.STRING)
  shipping_state: string;

  @Column(DataType.STRING)
  shipping_postal_code: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'TH',
  })
  shipping_country: string;

  // Payment Information
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  payment_method: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'PENDING',
  })
  payment_status: string;

  @Column(DataType.STRING)
  payment_transaction_id: string;

  // SLA Information
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 300, // 5 minutes default
  })
  sla_target_minutes: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  sla_elapsed_minutes: number;

  @Column({
    type: DataType.ENUM('BREACH', 'NEAR_BREACH', 'COMPLIANT'),
    allowNull: false,
    defaultValue: 'COMPLIANT',
  })
  sla_status: 'BREACH' | 'NEAR_BREACH' | 'COMPLIANT';

  @Column({
    type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    allowNull: false,
    defaultValue: 'MEDIUM',
  })
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  store_name: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata: Record<string, any>;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @HasMany(() => OrderItem)
  items: OrderItem[];
}