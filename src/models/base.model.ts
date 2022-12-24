import crypto from 'crypto';
import { Model, snakeCaseMappers } from 'objection';
import { omit } from '../utils';

export class BaseModel extends Model {
	id!: string;
	createdAt?: Date;
	updatedAt?: Date;

	static get modelPaths() {
		return [__dirname];
	}

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

	async $beforeInsert() {
		const randomId = await this.generateUuid();

		this.id = randomId;
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	$beforeUpdate() {
		this.updatedAt = new Date();
	}

	protected async generateUuid(): Promise<string> {
		const randomId = crypto.randomUUID();

		const userExisted = await this.$modelClass.query().findById(randomId);
		if (!userExisted) return randomId;

		return this.generateUuid();
	}
}
