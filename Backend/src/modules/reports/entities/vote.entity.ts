import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique,  } from 'typeorm';
import { VoteType } from '../enums/VoteType.enum';
import { Report } from './report.entity';

  @Entity()
@Unique(['userId', 'reportId'])
export class ReportVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  reportId: number;

  @Column({ type: 'enum', enum: VoteType })
  type: VoteType;

  @ManyToOne(() => Report, (report) => report.votes, { onDelete: 'CASCADE' })
  report: Report;
}