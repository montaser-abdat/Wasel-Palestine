import { Incident } from '../entities/incident.entity';
import { UpdateIncidentDto } from '../dto/update-incident.dto';
import { SelectQueryBuilder } from 'typeorm';


export class StatusUpdateStrategy {
  static apply(incident: Incident, updateIncidentDto: UpdateIncidentDto) {
    if (updateIncidentDto.status !== undefined) {
      incident.status = updateIncidentDto.status;
    }
  }
}

export class StatusStrategy {
  static apply(queryBuilder: SelectQueryBuilder<Incident>, status?: string) {
    if (status) {
      queryBuilder.andWhere('incident.status = :status', { status });
    }
  }
}
