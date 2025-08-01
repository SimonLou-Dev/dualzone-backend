import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'player_has_friends'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.boolean('accepted').defaultTo(false)
      table.uuid('user_id').unsigned().references('id').inTable('users').notNullable()
      table.uuid('friend_id').unsigned().references('id').inTable('users').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
