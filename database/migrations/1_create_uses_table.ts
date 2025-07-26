import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id', { primaryKey: true }).primary().index()
      table.string('pseudo').notNullable()
      table.string('steam_id').notNullable().unique()
      table.float('trust_score').notNullable().defaultTo(0.8)
      table.string('user_image').notNullable()
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
