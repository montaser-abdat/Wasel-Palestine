import { IsOptional, IsEnum, IsNumber, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportCategory } from '../enums/report-category.enum';
import { ReportStatus } from '../enums/report-status.enum';
export class ReportQueryDto {
    @IsOptional()
    @IsEnum(ReportCategory)
    category?: ReportCategory;

    @IsOptional()
    @IsEnum(ReportStatus)
    status?: ReportStatus;

  @IsOptional()
  @IsString()
  sort?: string;
  
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}