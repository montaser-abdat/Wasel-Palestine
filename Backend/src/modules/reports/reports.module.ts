import { Module } from '@nestjs/common';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportModerationAudit } from './entities/report-moderation-audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, ReportModerationAudit])],
  controllers: [ReportsController],
  providers:[ReportsService],
})
export class ReportsModule {}