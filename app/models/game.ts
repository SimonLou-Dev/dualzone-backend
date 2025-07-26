import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import GameMode from '#models/game_mode'
import * as relations from '@adonisjs/lucid/types/relations'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare description: string

  @hasMany(() => GameMode)
  declare gameModes: relations.HasMany<typeof GameMode>
}
