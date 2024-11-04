import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sanctions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('user_id').notNullable().unsigned().references('id').inTable('users')
      table.uuid('admin_id').notNullable().unsigned().references('id').inTable('users')
      table.string('reason').notNullable()
      table.bigInteger('duration').notNullable()
      table.tinyint('type').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
