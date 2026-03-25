
import { SelectQueryBuilder } from 'typeorm';
import { Incident } from '../entities/incident.entity';

export class TypeStrategy {
	static apply(
		queryBuilder: SelectQueryBuilder<Incident>,
		type?: string,
	) {
		if (type) {
			queryBuilder.andWhere('incident.type = :type', { type });
		}
	}
}
