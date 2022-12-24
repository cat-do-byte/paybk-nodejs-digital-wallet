import { Knex } from 'knex';
import { TransactionStatus, TransactionType } from '../../models/transaction.model';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('transactions', function (table) {
		table.uuid('id').primary();
		table.uuid('senderId').notNullable().references('users.id').onDelete('cascade');
		table.uuid('receiverId').nullable().references('users.id').onDelete('cascade');
		table.decimal('charge', 2, 2);
		table.decimal('amount', 10, 2);
		table.decimal('sendAmount', 10, 2);
		table.decimal('receiveAmount', 10, 2);
		table.text('note');
		table.enu('type', Object.values(TransactionType));
		table.enu('status', Object.values(TransactionStatus));
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('transactions');
}
