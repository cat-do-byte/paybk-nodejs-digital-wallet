import { Model, snakeCaseMappers } from 'objection';
import { omit } from '../utils';

export class BaseModel extends Model {
	id!: number;
	createdAt?: Date;
	updatedAt?: Date;

	hiddens(): string[] {
		return [];
	}

	$parseDatabaseJson(jsonRaw: Model): any {
		// process exclude properties is setted in hidden
		const json = super.$parseDatabaseJson(jsonRaw);
		const hiddens = this.hiddens();
		if (hiddens.length === 0) return json;

		return omit(json, hiddens);
	}

	$beforeInsert() {
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	$beforeUpdate() {
		this.updatedAt = new Date();
	}

	static get columnNameMappers() {
		return snakeCaseMappers();
	}
}
