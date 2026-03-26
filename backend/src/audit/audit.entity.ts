import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column()
  action: string;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', name: 'old_value', nullable: true })
  oldValue: any;

  @Column({ type: 'jsonb', name: 'new_value', nullable: true })
  newValue: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
