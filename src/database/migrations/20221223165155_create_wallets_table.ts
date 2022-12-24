import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('wallets', function (table) {
		table.uuid('id').primary();
		table.uuid('userId').notNullable();
		table.foreign('userId').references('id').inTable('users').onDelete('cascade');
		table.decimal('balance', 12, 2);
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('wallets');
}
