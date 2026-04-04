import { Module } from '@nestjs/common';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportModerationAudit } from './entities/report-moderation-audit.entity';
import { ReportVote } from './entities/vote.entity';
import { ReportConfirmation } from './entities/report-confirmation.entity';
import { ReportCredibilityService } from './services/report-credibility.service';
@Module({
  imports: [TypeOrmModule.forFeature([Report,ReportModerationAudit,ReportVote, ReportConfirmation])],
  controllers: [ReportsController],
  providers:[ReportsService, ReportCredibilityService],
})
export class ReportsModule {}