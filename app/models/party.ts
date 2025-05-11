import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import * as relations from '@adonisjs/lucid/types/relations'
import GameMode from '#models/game_mode'
import PartyTeam from '#models/party_team'
import PartyEvent from '#models/party_event'

export default class Party extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  public static async createUUID(model: Party) {
    model.id = randomUUID()
  }

  @column()
  declare serverId: string

  @column()
  declare modeId: number

  @column()
  declare ended: boolean

  @column()
  declare partyTime: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => GameMode)
  declare mode: relations.BelongsTo<typeof GameMode>

  @hasMany(() => PartyTeam)
  declare teams: relations.HasMany<typeof PartyTeam>

  @hasMany(() => PartyEvent)
  declare event: relations.HasMany<typeof PartyEvent>
}
