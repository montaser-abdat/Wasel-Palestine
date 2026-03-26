import { Incident } from '../entities/incident.entity';
import { UpdateIncidentDto } from '../dto/update-incident.dto';

export class TitleStrategy {
  static apply(incident: Incident, updateIncidentDto: UpdateIncidentDto) {
    if (updateIncidentDto.title !== undefined) {
      incident.title = updateIncidentDto.title;
    }
  }
}
