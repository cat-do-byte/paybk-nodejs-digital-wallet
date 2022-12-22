import { Model, ModelClass, QueryBuilder } from 'objection';

export default abstract class BaseRepository<T extends Model> {
	public model: ModelClass<T>;
	public constructor(model: ModelClass<T>) {
		this.model = model;
	}
	findById(id: number): Promise<T> {
		return this.model.query().findById(id).castTo<T>();
	}

	find(): Promise<T[]> {
		return this.model.query().castTo<T[]>();
	}

	/* public model: ModelClass<T>;
	public constructor(model: ModelClass<T>) {
		this.model = model;
	}
	protected async findById(id: number): Promise<T[]> {
		return this.model.query().castTo<T[]>();
	} */

	/* public model: typeof Model;
	public constructor(model: typeof Model) {
		this.model = model;
	}
	async findById(id: number): Promise<Model[]> {
		return this.model.query();
	} */
}
