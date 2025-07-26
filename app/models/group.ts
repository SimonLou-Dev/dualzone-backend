import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import * as relations from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'

export default class Group extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare leaderId: string

  @column()
  declare size: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'leaderId',
  })
  declare leader: relations.BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'group_has_players',
  })
  declare members: relations.ManyToMany<typeof User>

  @beforeCreate()
  static assignUuid(group: Group) {
    group.id = randomUUID()
  }
}
