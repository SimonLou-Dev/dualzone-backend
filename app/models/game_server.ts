import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import Fleet from '#models/fleet'
import * as relations from '@adonisjs/lucid/types/relations'
import GameServerStatus from '#models/game_server_status'

export default class GameServer extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  public static async createUUID(model: GameServer) {
    model.id = randomUUID()
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare fleetId: number

  @column()
  declare ip: string

  @column()
  declare port: number

  @column()
  declare statusId: number

  @belongsTo(() => Fleet)
  declare fleet: relations.BelongsTo<typeof Fleet>

  @belongsTo(() => GameServerStatus)
  declare status: relations.BelongsTo<typeof GameServerStatus>
}
