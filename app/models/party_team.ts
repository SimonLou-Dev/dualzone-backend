import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import Party from '#models/party'
import * as relations from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class PartyTeam extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare score: string

  @column()
  declare partyId: string

  @column()
  declare winProbability: number

  @belongsTo(() => Party)
  declare party: relations.BelongsTo<typeof Party>

  @manyToMany(() => User, {
    pivotTable: 'team_has_players',
  })
  declare players: relations.ManyToMany<typeof User>
}
