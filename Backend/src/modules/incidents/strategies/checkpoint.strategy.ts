
import { SelectQueryBuilder } from 'typeorm';
import { Incident } from '../entities/incident.entity';

export class CheckpointStrategy {
	static apply(
		queryBuilder: SelectQueryBuilder<Incident>,
		checkpointId?: number,
	) {
		if (checkpointId !== undefined) {
			queryBuilder.andWhere('incident.checkpointId = :checkpointId', { checkpointId });
		}
	}
}
