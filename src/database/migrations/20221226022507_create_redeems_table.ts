import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('redeems', function (table) {
		table.uuid('id').primary();
		table.uuid('transactionId').notNullable().references('transactions.id').onDelete('cascade');
		table.string('code').notNullable();
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('redeems');
}
