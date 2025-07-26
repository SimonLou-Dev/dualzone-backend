import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fleets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.string('namespace')
      table.boolean('autoscaling')
      table.integer('as_min').unsigned().nullable().defaultTo(null)
      table.integer('as_max').unsigned().nullable().defaultTo(null)
      table.integer('as_buffer').unsigned().nullable().defaultTo(null)
      table.integer('requested').unsigned()
      table.integer('available').unsigned()
      table.integer('reserved').unsigned()
      table.integer('game_id').unsigned().references('id').inTable('games').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
