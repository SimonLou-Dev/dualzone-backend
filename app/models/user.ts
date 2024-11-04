import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, manyToMany } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { randomUUID } from 'node:crypto'
import * as relations from '@adonisjs/lucid/types/relations'
import Role from '#models/role'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare pseudo: string

  @column()
  declare steamId: string

  @column()
  declare steamToken: string

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
  })

  @beforeCreate()
  public static async createUUID(model: User) {
    model.id = randomUUID()
  }

  @manyToMany(() => User, {
    pivotTable: 'player_has_friends',
  })
  declare friends: relations.ManyToMany<typeof User>

  @manyToMany(() => Role, {
    pivotTable: 'user_has_roles',
  })
  declare roles: relations.ManyToMany<typeof Role>
}
