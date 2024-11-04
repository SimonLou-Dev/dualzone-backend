import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Game from '#models/game'
import * as relations from '@adonisjs/lucid/types/relations'

export default class GameImage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare port: number

  @column()
  declare tag: number

  @column()
  declare image: string

  @column()
  declare gameId: number

  @belongsTo(() => Game)
  declare game: relations.BelongsTo<typeof Game>
}
