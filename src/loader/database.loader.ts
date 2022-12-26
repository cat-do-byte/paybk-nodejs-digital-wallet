import Knex from 'knex';
import { Model } from 'objection';
import config from '../configuration';
import knexConfig from '../database/knexfile';
import Redeem from '../models/redeem.model';
import Transaction from '../models/transaction.model';
import User from '../models/user.model';
import Wallet from '../models/wallet.model';

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

	// TODO list by directory
	const userModel: IKnexModel = {
		name: User.name,
		model: User,
	};

	const transactionModel: IKnexModel = {
		name: Transaction.name,
		model: Transaction,
	};

	const walletModel: IKnexModel = {
		name: Wallet.name,
		model: Wallet,
	};

	const redeemModel: IKnexModel = {
		name: Redeem.name,
		model: Redeem,
	};

	return [userModel, walletModel, transactionModel, redeemModel];
};

export default databaseLoader;
