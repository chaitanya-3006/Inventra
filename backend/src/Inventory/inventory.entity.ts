import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ name: 'total_quantity', default: 0 })
  totalQuantity: number;

  @Column({ name: 'reserved_quantity', default: 0 })
  reservedQuantity: number;

  @Column({ name: 'locked_quantity', default: 0 })
  lockedQuantity: number;

  @Column({ name: 'available_quantity', select: true, insert: false, update: false })
  availableQuantity: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
