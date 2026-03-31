import { Incident } from '../entities/incident.entity';
import { UpdateIncidentDto } from '../dto/update-incident.dto';

export class TypeUpdateStrategy {
  static apply(incident: Incident, updateIncidentDto: UpdateIncidentDto) {
    if (updateIncidentDto.type !== undefined) {
      incident.type = updateIncidentDto.type;
    }
  }
}
