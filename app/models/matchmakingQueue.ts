import { DateTime } from 'luxon'
import { BaseModel, column, hasManyThrough, hasOne } from '@adonisjs/lucid/orm'
import User from '#models/user'
import * as relations from '@adonisjs/lucid/types/relations'
import Group from '#models/group'

export default class MatchmakingQueue extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare avgElo: number

  @column()
  declare minElo: number

  @column()
  declare maxElo: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare groupId: string

  @column()
  declare isTeam: boolean

  @hasOne(() => Group)
  declare Group: relations.HasOne<typeof Group>

  @hasManyThrough([() => User, () => Group])
  declare grouped_users: relations.HasManyThrough<typeof User>
}
