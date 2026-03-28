import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
@Post()
create(@Body() dto: CreateReportDto) {
  return this.reportsService.create(dto);
}

@Get()
findAll(@Query() query: ReportQueryDto) {
  return this.reportsService.findAll(query);
}

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.reportsService.findOne(id);
}

@Patch(':id')
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateReportDto,
) {
  return this.reportsService.update(id, dto);
}

@Patch(':id/review')
markUnderReview(@Param('id', ParseIntPipe) id: number) {
  return this.reportsService.markUnderReview(id);
}

@Patch(':id/approve')
approve(@Param('id', ParseIntPipe) id: number) {
  return this.reportsService.approve(id);
}

@Patch(':id/reject')
reject(@Param('id', ParseIntPipe) id: number) {
  return this.reportsService.reject(id);
}

@Patch(':id/resolve')
resolve(@Param('id', ParseIntPipe) id: number) {
  return this.reportsService.resolve(id);
}
  
}
