import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import User from '#models/user'
import * as relations from '@adonisjs/lucid/types/relations'

export default class Report extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare reporterId: string

  @column()
  declare targetId: string

  @belongsTo(() => User)
  declare reporter: relations.BelongsTo<typeof User>

  @hasOne(() => User)
  declare target: relations.HasOne<typeof User>
}
