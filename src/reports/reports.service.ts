import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportStatus } from './enums/report-status.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
  ) {}

async create(dto: CreateReportDto) {
  const duplicate = await this.findDuplicate(dto);

  const report = this.reportRepo.create(dto);

  if (duplicate) {
    report.duplicateOf = duplicate.id;
  }

  return this.reportRepo.save(report);
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

async markUnderReview(id: number) {
  const report = await this.findOne(id);
  report.status = ReportStatus.UNDER_REVIEW;
  return this.reportRepo.save(report);
}

async approve(id: number) {
  const report = await this.findOne(id);
  report.status = ReportStatus.APPROVED;
  return this.reportRepo.save(report);
}

async reject(id: number) {
  const report = await this.findOne(id);
  report.status = ReportStatus.REJECTED;
  return this.reportRepo.save(report);
}

async resolve(id: number) {
  const report = await this.findOne(id);
  report.status = ReportStatus.RESOLVED;
  return this.reportRepo.save(report);
}

}