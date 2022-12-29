import { Knex } from 'knex';
import { VoucherStatus, VoucherType } from '../../models/voucher.model';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('vouchers', function (table) {
		table.uuid('id').primary();
		table.uuid('creatorId').nullable().references('users.id').onDelete('cascade');
		table.uuid('applyFor').nullable().references('users.id').onDelete('cascade');
		table.decimal('value').notNullable();
		table.enu('type', Object.values(VoucherType)).notNullable();
		table
			.enu('status', Object.values(VoucherStatus))
			.defaultTo(VoucherStatus.AVAILABLE)
			.notNullable();
		table.integer('maxUsage').notNullable();
		table.string('code').notNullable();
		table.integer('maxUsageByAccount').notNullable();
		table.timestamp('expireAt').notNullable();
		table.specificType('usedBy', 'text []');
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('vouchers');
}
