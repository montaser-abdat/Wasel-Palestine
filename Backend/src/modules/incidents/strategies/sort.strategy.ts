
import { SelectQueryBuilder } from 'typeorm';
import { Incident } from '../entities/incident.entity';

export class SortStrategy {
	static apply(
		queryBuilder: SelectQueryBuilder<Incident>,
		sortBy?: string,
		sortOrder: 'ASC' | 'DESC' = 'ASC',
	) {
		if (sortBy) {
			queryBuilder.addOrderBy(`incident.${sortBy}`, sortOrder);
		}
	}
}
