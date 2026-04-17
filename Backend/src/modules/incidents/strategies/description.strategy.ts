import { Incident } from '../entities/incident.entity';
import { UpdateIncidentDto } from '../dto/update-incident.dto';

export class DescriptionStrategy {
  static apply(incident: Incident, updateIncidentDto: UpdateIncidentDto) {
    if (updateIncidentDto.description !== undefined) {
      incident.description = updateIncidentDto.description;
    }
  }
}
