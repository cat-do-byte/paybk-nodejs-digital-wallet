import { Model, snakeCaseMappers } from 'objection';

export class BaseModel extends Model {
	createdAt?: Date;
	updatedAt?: Date;

	$beforeInsert() {
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	$beforeUpdate() {
		this.updatedAt = new Date();
	}

	static get columnNameMappers() {
		return snakeCaseMappers({ upperCase: true });
	}
}
