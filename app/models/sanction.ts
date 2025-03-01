import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import * as relations from '@adonisjs/lucid/types/relations'

export default class Sanction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare reason: string

  @column()
  //Number of days from the creation date
  //0 for permanent
  declare duration: number

  @column()
  //0 For warn
  //1 For ban
  declare type: number

  @column()
  declare userId: string

  @column()
  declare adminId: string

  @belongsTo(() => User)
  declare user: relations.BelongsTo<typeof User>

  @belongsTo(() => User)
  declare admin: relations.BelongsTo<typeof User>
}
