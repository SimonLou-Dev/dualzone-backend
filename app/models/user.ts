import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { randomUUID } from 'node:crypto'
import * as relations from '@adonisjs/lucid/types/relations'
import Role from '#models/role'
import UserRank from '#models/user_rank'
import Ticket from '#models/ticket'
import Sanction from '#models/sanction'
import Report from '#models/report'
import Group from '#models/group'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare pseudo: string

  @column()
  declare steamId: string

  @column()
  declare trustScore: number

  @column()
  declare userImage: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    type: 'auth_token',
  })

  @beforeCreate()
  public static async createUUID(model: User) {
    model.id = randomUUID()
  }

  @manyToMany(() => User, {
    pivotTable: 'player_has_friends',
    pivotRelatedForeignKey: 'friend_id',
    pivotForeignKey: 'user_id',
    pivotColumns: ['accepted'],
    onQuery: (query) => {
      query.where('accepted', true)
    },
  })
  declare friends: relations.ManyToMany<typeof User>

  @manyToMany(() => Group, {
    pivotTable: 'group_has_players',
  })
  declare group: relations.ManyToMany<typeof Group>

  @manyToMany(() => Role, {
    pivotTable: 'user_has_roles',
  })
  declare roles: relations.ManyToMany<typeof Role>

  @hasMany(() => UserRank)
  declare ranks: relations.HasMany<typeof UserRank>

  @hasMany(() => Ticket)
  declare tickets: relations.HasMany<typeof Ticket>

  @hasMany(() => Sanction)
  declare sanctions: relations.HasMany<typeof Sanction>

  @hasMany(() => Report)
  declare reports: relations.HasMany<typeof Report>

  @manyToMany(() => User, {
    pivotTable: 'player_has_friends',
    pivotRelatedForeignKey: 'friend_id',
    pivotForeignKey: 'user_id',
    pivotColumns: ['accepted'],
    onQuery: (query) => {
      query.where('accepted', false)
    },
  })
  declare friendRequestSent: relations.ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'player_has_friends',
    pivotRelatedForeignKey: 'user_id',
    pivotForeignKey: 'friend_id',
    pivotColumns: ['accepted'],
    onQuery: (query) => {
      query.where('accepted', false)
    },
  })
  declare friendRequestReceived: relations.ManyToMany<typeof User>
}
