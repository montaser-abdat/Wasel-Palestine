import { IsEnum, IsNumber, IsString,Min,Max } from 'class-validator';
import { ReportCategory } from '../enums/report-category.enum';

export class CreateReportDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsEnum(ReportCategory)
  category: ReportCategory;

  @IsString()
  description: string;

  @IsNumber()
  submittedByUserId: number;
}