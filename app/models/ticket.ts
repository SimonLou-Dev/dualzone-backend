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

  @belongsTo(() => User)
  declare sender: relations.BelongsTo<typeof User>

  @manyToMany(() => TicketMessage, {
    pivotTable: 'ticket_messages',
  })
  declare messages: relations.ManyToMany<typeof TicketMessage>

  @manyToMany(() => User, {
    pivotTable: 'ticket_has_users',
  })
  declare members: relations.ManyToMany<typeof User>
}
