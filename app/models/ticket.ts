import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import * as relations from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import TicketMessage from '#models/ticket_message'

export default class Ticket extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare title: string

  @column()
  declare terminated: boolean

  @column()
  declare senderId: string

  @belongsTo(() => User, {
    foreignKey: 'senderId',
  })
  declare sender: relations.BelongsTo<typeof User>

  @hasMany(() => TicketMessage)
  declare messages: relations.HasMany<typeof TicketMessage>

  @manyToMany(() => User, {
    pivotTable: 'ticket_has_users',
    pivotForeignKey: 'ticket_id',
    pivotRelatedForeignKey: 'member_id',
  })
  declare members: relations.ManyToMany<typeof User>
}
