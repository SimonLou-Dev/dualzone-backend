import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matchmaking_queues'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('group_id').notNullable().unique().references('id').inTable('groups')
      table.integer('game_mode_id').unsigned().references('id').inTable('game_modes')
      table.integer('avg_elo').notNullable()
      table.integer('min_elo').notNullable()
      table.integer('max_elo').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
