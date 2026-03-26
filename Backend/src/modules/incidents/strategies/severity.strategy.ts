import { Incident } from '../entities/incident.entity';
import { UpdateIncidentDto } from '../dto/update-incident.dto';
import { SelectQueryBuilder } from 'typeorm';

export class SeverityUpdateStrategy {
  static apply(incident: Incident, updateIncidentDto: UpdateIncidentDto) {
    if (updateIncidentDto.severity !== undefined) {
      incident.severity = updateIncidentDto.severity;
    }
  }
}

export class SeverityStrategy {
  static apply(queryBuilder: SelectQueryBuilder<Incident>, severity?: string) {
    if (severity) {
      queryBuilder.andWhere('incident.severity = :severity', { severity });
    }
  }
}
