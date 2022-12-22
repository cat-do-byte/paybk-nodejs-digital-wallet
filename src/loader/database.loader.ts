import Knex from 'knex';
import { Model } from 'objection';
import config from '../configuration';
import knexConfig from '../database/knexfile';
import User from '../models/user.model';

interface IKnexModel {
	name: string;
	model: typeof Model;
}

const databaseLoader = async (): Promise<IKnexModel[]> => {
	const env = config.env;

	const knex = Knex(knexConfig[env]);
	Model.knex(knex);

	await knex
		.raw('SELECT 1')
		.then(() => {
			console.log('Database connect is initted');
		})
		.catch((e) => {
			console.log('Cannot connect database');
			console.error(e);
		});

	const userModel: IKnexModel = {
		name: User.name,
		model: User,
	};
	return [userModel];
};

export default databaseLoader;
