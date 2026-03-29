import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportStatus } from './enums/report-status.enum';
import { ReportModerationAudit } from './entities/report-moderation-audit.entity';
import { ReportModerationAction } from './enums/report-moderation-action.enum';
import { MoreThan } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(ReportModerationAudit)
    private readonly auditRepo: Repository<ReportModerationAudit>,
  ) {}

async create(dto: CreateReportDto) {
  // Abuse-prevention checks
  await this.validatePayload(dto);
  await this.checkRateLimit(dto.submittedByUserId);
  await this.detectSpam(dto);

  const duplicate = await this.findDuplicate(dto);
  const report = this.reportRepo.create(dto);
  if (duplicate) {
    report.duplicateOf = duplicate.id;
  }
  return this.reportRepo.save(report);
}

private async checkRateLimit(userId: number) {
  // Allow max 3 reports in last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentCount = await this.reportRepo.count({
    where: { submittedByUserId: userId, createdAt: MoreThan(fiveMinutesAgo) },
  });
  if (recentCount >= 3) {
    throw new BadRequestException('Rate limit exceeded: You can only submit 3 reports every 5 minutes.');
  }
}

private async detectSpam(dto: CreateReportDto) {
  // Check for same user, category, and location within 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const spam = await this.reportRepo.findOne({
    where: {
      submittedByUserId: dto.submittedByUserId,
      category: dto.category,
      latitude: dto.latitude,
      longitude: dto.longitude,
      createdAt: MoreThan(thirtyMinutesAgo),
    },
  });
  if (spam) {
    throw new BadRequestException('Duplicate or near-duplicate report detected. Please avoid spamming.');
  }
}

private async validatePayload(dto: CreateReportDto) {
  // Coordinates already validated by DTO, but double-check for realism
  if (Math.abs(dto.latitude) > 90 || Math.abs(dto.longitude) > 180) {
    throw new BadRequestException('Invalid coordinates.');
  }
  // Description must be non-empty and meaningful
  if (!dto.description || dto.description.trim().length < 10) {
    throw new BadRequestException('Description is too short or empty.');
  }
  // Optionally, check for unrealistic values (e.g., all zeros)
  if (dto.latitude === 0 && dto.longitude === 0) {
    throw new BadRequestException('Invalid location.');
  }
}

async findAll(query: ReportQueryDto) {
  let {  category, status, sort, sortOrder, page = 1, limit = 10, } = query;

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  if (sort) sort = sort.trim();

  const queryBuilder = this.reportRepo.createQueryBuilder('report');


  if (category) {
    queryBuilder.andWhere('report.category = :category', { category });
  }

  if (status) {
    queryBuilder.andWhere('report.status = :status', { status });
  }

  const allowedSortFields = ['createdAt', 'status', 'category'];

  let order: 'ASC' | 'DESC' = 'DESC'; 

  if (sortOrder === 'ASC' || sortOrder === 'DESC') {
    order = sortOrder;
  }

  if (sort && allowedSortFields.includes(sort)) {
    queryBuilder.orderBy(`report.${sort}`, order);
  } else {
    queryBuilder.orderBy('report.createdAt', 'DESC');
  }

  queryBuilder.skip((page - 1) * limit).take(limit);


  const [data, total] = await queryBuilder.getManyAndCount();

  return { data,  total,  page,  limit,  totalPages: Math.ceil(total / limit), };
}

  async findOne(id: number) {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async update(id: number, dto: UpdateReportDto) {
    const report = await this.findOne(id);
    Object.assign(report, dto);
    return this.reportRepo.save(report);
  }


  async findDuplicate(reportDto: CreateReportDto) {

    const timeWindow= new Date(Date.now() - 30*60*1000);
      return this.reportRepo
    .createQueryBuilder('report')
    .where('report.category = :category', { category: reportDto.category })
    .andWhere('report.createdAt >= :timeWindow', { timeWindow })
   .andWhere(`
  (6371000 * acos(
    cos(radians(:lat)) *
    cos(radians(report.latitude)) *
    cos(radians(report.longitude) - radians(:lng)) +
    sin(radians(:lat)) *
    sin(radians(report.latitude))
  )) < 50
`, {
  lat: reportDto.latitude,
  lng: reportDto.longitude,
})
    .getOne();


  }


// Moderation actions now require performedByUserId and optional notes

private async logAction(reportId: number, action: ReportModerationAction, performedByUserId: number, notes?: string) {
  await this.auditRepo.save({
    reportId,
    action,
    performedByUserId,
    notes,
  });
}

async markUnderReview(id: number, performedByUserId: number, notes?: string) {
  const report = await this.findOne(id);
  this.validateStatusTransition(report.status, ReportStatus.UNDER_REVIEW);
  report.status = ReportStatus.UNDER_REVIEW;
  const saved = await this.reportRepo.save(report);
  await this.logAction(id, ReportModerationAction.UNDER_REVIEW, performedByUserId, notes);
  return saved;
}

async approve(id: number, performedByUserId: number, notes?: string) {
  const report = await this.findOne(id);
  this.validateStatusTransition(report.status, ReportStatus.APPROVED);
  report.status = ReportStatus.APPROVED;
  const saved = await this.reportRepo.save(report);
  await this.logAction(id, ReportModerationAction.APPROVED, performedByUserId, notes);
  return saved;
}

async reject(id: number, performedByUserId: number, notes?: string) {
  const report = await this.findOne(id);
  this.validateStatusTransition(report.status, ReportStatus.REJECTED);
  report.status = ReportStatus.REJECTED;
  const saved = await this.reportRepo.save(report);
  await this.logAction(id, ReportModerationAction.REJECTED, performedByUserId, notes);
  return saved;
}

async resolve(id: number, performedByUserId: number, notes?: string) {
  const report = await this.findOne(id);
  this.validateStatusTransition(report.status, ReportStatus.RESOLVED);
  report.status = ReportStatus.RESOLVED;
  const saved = await this.reportRepo.save(report);
  await this.logAction(id, ReportModerationAction.RESOLVED, performedByUserId, notes);
  return saved;
}

private validateStatusTransition(currentStatus: ReportStatus, targetStatus: ReportStatus) {
  if (currentStatus === targetStatus) {
    throw new BadRequestException(`Report is already ${currentStatus}`);
  }
  if (currentStatus === ReportStatus.RESOLVED) {
    throw new BadRequestException('Cannot modify a resolved report');
  }
  if (currentStatus === ReportStatus.REJECTED && targetStatus === ReportStatus.APPROVED) {
    throw new BadRequestException('Cannot approve a rejected report');
  }
}
}