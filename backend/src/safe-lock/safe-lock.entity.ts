import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('safe_locks')
export class SafeLock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_id' })
  inventoryId: string;

  @Column({ name: 'admin_id' })
  adminId: string;

  @Column()
  quantity: number;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  permanent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;
}
