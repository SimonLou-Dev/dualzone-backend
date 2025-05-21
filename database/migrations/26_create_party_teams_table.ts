import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'party_teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('party_id').unsigned().references('id').inTable('parties')
      table.float('win_probability').notNullable().defaultTo(0)
      table.float('score').notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
