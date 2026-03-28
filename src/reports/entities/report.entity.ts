import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ReportCategory } from '../enums/report-category.enum';
import { ReportStatus } from '../enums/report-status.enum';
@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

@Column({
  type: 'enum',
  enum: ReportCategory,
})
category: ReportCategory;


@Column('text')
description: string;


@Column({
  type: 'enum',
  enum: ReportStatus,
  default: ReportStatus.PENDING,
})
status: ReportStatus;
  @Column()
  submittedByUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}