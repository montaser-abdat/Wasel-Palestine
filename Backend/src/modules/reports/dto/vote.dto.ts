import { IsEnum, IsNumber } from 'class-validator';
import { VoteType } from '../enums/VoteType.enum';
export class VoteReportDto {
  @IsNumber()
  reportId: number;

  @IsEnum(VoteType)
  type: VoteType;
}