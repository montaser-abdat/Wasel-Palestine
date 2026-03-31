import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ReportModerationAction } from '../enums/report-moderation-action.enum';

@Entity('report_moderation_audit')
export class ReportModerationAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reportId: number;

  @Column({ type: 'enum', enum: ReportModerationAction })
  action: ReportModerationAction;

  @Column()
  performedByUserId: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
