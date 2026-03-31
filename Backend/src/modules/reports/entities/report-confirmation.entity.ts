import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class ReportConfirmation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reportId: number;

  @Column()
  userId: number;
}