import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { randomUUID } from 'node:crypto'

export default class User extends BaseModel {

  @column({ isPrimary: true})
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
  static assignUuid(user: User) {
    user.id = randomUUID()
  }
}
