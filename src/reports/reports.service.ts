import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
  ) {}

  create(dto: CreateReportDto) {
    const report = this.reportRepo.create(dto);
    return this.reportRepo.save(report);
  }

  findAll() {
    return this.reportRepo.find();
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
}