import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Query, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './services/reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { VoteReportDto } from './dto/vote.dto';
import { ReportCredibilityService } from './services/report-credibility.service';
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService,
    private readonly credibilityService: ReportCredibilityService
  ) {}

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  markUnderReview(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reportsService.markUnderReview(id, req.user.id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reportsService.approve(id, req.user.id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reject(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reportsService.reject(id, req.user.id);
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  resolve(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reportsService.resolve(id, req.user.id);
  }

  @Post(':id/vote')
  async voteReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VoteReportDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || dto['userId']; 

    return this.credibilityService.vote(id, userId, dto.type);
  }


  @Post(':id/confirm')
  async confirmReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const userId = req.user?.id;

    return this.credibilityService.confirm(id, userId);
  }
  
}
