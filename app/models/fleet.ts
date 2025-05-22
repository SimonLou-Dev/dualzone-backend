import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column} from '@adonisjs/lucid/orm'
import Game from '#models/game'
import * as relations from '@adonisjs/lucid/types/relations'

export default class Fleet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare namespace: string

  @column()
  declare autoscaling: boolean

  @column()
  declare as_min: number | null

  @column()
  declare as_max: number | null

  @column()
  declare as_buffer: number | null

  @column()
  declare requested: number

  @column()
  declare available: number

  @column()
  declare reserved: number

  @column()
  declare gameId: number

  @belongsTo(() => Game)
  declare game: relations.BelongsTo<typeof Game>
}
