import { Knex } from 'knex';
import { UserRole, UserStatus } from '../../models/user.model';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('users', function (table) {
		table.increments().primary();
		table.string('username', 255).unique().notNullable();
		table.string('email', 255).unique().notNullable();
		table.string('password', 255).notNullable();
		table.enu('status', Object.values(UserStatus));
		table.enu('role', Object.values(UserRole));
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('users');
}
