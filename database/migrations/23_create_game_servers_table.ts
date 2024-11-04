import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_servers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.integer('fleet_id').unsigned().notNullable().references('id').inTable('fleets')
      table.string('ip').notNullable()
      table.integer('port').notNullable()
      table.integer('status_id').references('id').inTable('game_server_statuses')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
