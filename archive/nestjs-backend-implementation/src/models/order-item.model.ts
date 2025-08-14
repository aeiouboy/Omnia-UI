import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';

export interface OrderItemAttributes {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_description?: string;
  product_category?: string;
  product_brand?: string;
}

@Table({
  tableName: 'order_items',
  timestamps: true,
})
export class OrderItem extends Model<OrderItemAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  order_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  product_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  product_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  product_sku: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  unit_price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  total_price: number;

  @Column(DataType.TEXT)
  product_description: string;

  @Column(DataType.STRING)
  product_category: string;

  @Column(DataType.STRING)
  product_brand: string;

  @BelongsTo(() => Order)
  order: Order;
}