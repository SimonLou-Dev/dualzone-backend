import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'parties'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().index()
      table.uuid('server_id')
      table.integer('game_mode_id').references('id').inTable('game_modes')
      table.string('status').defaultTo('CREATING')
      table.boolean('ended').defaultTo(false)
      table.integer('party_time').defaultTo(null).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
