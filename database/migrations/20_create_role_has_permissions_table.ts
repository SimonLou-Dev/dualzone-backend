import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_has_permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('permission_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('permissions')
        .onDelete('CASCADE')
      table
        .integer('role_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('roles')
        .onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
