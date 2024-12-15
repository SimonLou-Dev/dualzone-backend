import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import * as relations from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Ticket from '#models/ticket'

export default class TicketMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare message: string

  @column()
  declare ticketId: number

  @column()
  declare senderId: string

  @belongsTo(() => User, {
    foreignKey: 'senderId',
    localKey: 'id',
  })
  declare sender: relations.BelongsTo<typeof User>

  @belongsTo(() => Ticket)
  declare ticket: relations.BelongsTo<typeof Ticket>
}
