import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from './entities/incident.entity';
import { Checkpoint } from '../checkpoints/entities/checkpoint.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import {
  IncidentQueryDto,
  IncidentSortBy,
  SortOrder,
} from './dto/incident-query.dto';
import { IncidentStatus } from './enums/incident-status.enum';
import { SortStrategy } from './strategies/sort.strategy';
import { CheckpointStrategy } from './strategies/checkpoint.strategy';
import {
  SeverityStrategy,
  SeverityUpdateStrategy,
} from './strategies/severity.strategy';
import { TypeStrategy } from './strategies/type.strategy';
import {
  StatusStrategy,
  StatusUpdateStrategy,
} from './strategies/status.strategy';
import { TitleStrategy } from './strategies/title.strategy';
import { DescriptionStrategy } from './strategies/description.strategy';
import { TypeUpdateStrategy } from './strategies/type-update.strategy';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentsRepository: Repository<Incident>,

    @InjectRepository(Checkpoint)
    private readonly checkpointsRepository: Repository<Checkpoint>,
  ) {}

  async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
    let checkpoint: Checkpoint | null = null;

    if (createIncidentDto.checkpointId) {
      checkpoint = await this.checkpointsRepository.findOne({
        where: { id: createIncidentDto.checkpointId },
      });

      if (!checkpoint) {
        throw new NotFoundException(
          `Checkpoint with id ${createIncidentDto.checkpointId} not found`,
        );
      }
    }

    const incident = this.incidentsRepository.create({
      title: createIncidentDto.title,
      description: createIncidentDto.description,
      type: createIncidentDto.type,
      severity: createIncidentDto.severity,
      status: createIncidentDto.status ?? IncidentStatus.OPEN,
      checkpoint: checkpoint ?? undefined,
    });

    return this.incidentsRepository.save(incident);
  }

  async findAll(incidentQueryDto: IncidentQueryDto) {
    const {
      status,
      type,
      severity,
      checkpointId,
      sortBy = IncidentSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 10,
    } = incidentQueryDto;

    const queryBuilder = this.incidentsRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.checkpoint', 'checkpoint');

    StatusStrategy.apply(queryBuilder, status);
    TypeStrategy.apply(queryBuilder, type);
    SeverityStrategy.apply(queryBuilder, severity);
    CheckpointStrategy.apply(queryBuilder, checkpointId);
    SortStrategy.apply(queryBuilder, sortBy, sortOrder);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async findOne(id: number): Promise<Incident> {
    const incident = await this.incidentsRepository.findOne({
      where: { id },
      relations: ['checkpoint'],
    });

    if (!incident) {
      throw new NotFoundException(`Incident with id ${id} not found`);
    }

    return incident;
  }

  async update(
    id: number,
    updateIncidentDto: UpdateIncidentDto,
  ): Promise<Incident> {
    const incident = await this.findOne(id);

    if (updateIncidentDto.checkpointId !== undefined) {
      if (updateIncidentDto.checkpointId === null) {
        incident.checkpoint = undefined;
      } else {
        const checkpoint = await this.checkpointsRepository.findOne({
          where: { id: updateIncidentDto.checkpointId },
        });

        if (!checkpoint) {
          throw new NotFoundException(
            `Checkpoint with id ${updateIncidentDto.checkpointId} not found`,
          );
        }

        incident.checkpoint = checkpoint;
      }
    }

    TitleStrategy.apply(incident, updateIncidentDto);
    DescriptionStrategy.apply(incident, updateIncidentDto);
    TypeUpdateStrategy.apply(incident, updateIncidentDto);
    SeverityUpdateStrategy.apply(incident, updateIncidentDto);
    StatusUpdateStrategy.apply(incident, updateIncidentDto);

    return this.incidentsRepository.save(incident);
  }

  async verify(id: number, userId: number): Promise<Incident> {
    const incident = await this.findOne(id);

    if (incident.status === IncidentStatus.CLOSED) {
      throw new BadRequestException('Closed incident cannot be verified');
    }

    if (incident.status === IncidentStatus.VERIFIED) {
      throw new BadRequestException('Incident is already verified');
    }

    incident.status = IncidentStatus.VERIFIED;
    incident.verifiedByUserId = userId;
    incident.verifiedAt = new Date();

    return this.incidentsRepository.save(incident);
  }

  async close(id: number, userId: number): Promise<Incident> {
    const incident = await this.findOne(id);

    if (incident.status === IncidentStatus.CLOSED) {
      throw new BadRequestException('Incident is already closed');
    }

    incident.status = IncidentStatus.CLOSED;
    incident.closedByUserId = userId;
    incident.closedAt = new Date();

    return this.incidentsRepository.save(incident);
    
  }
}
