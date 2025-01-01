import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'
import transmit from '@adonisjs/transmit/services/main'

export default class FriendshipDeleted extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public local: User,
    public remote: User
  ) {
    super()
    transmit.broadcast(`users/${remote.id}/notify`, {
      message: `${local.pseudo} vous a retiré de sa liste d'amis`,
    })
    transmit.broadcast(`users/${local.id}/notify`, {
      message: `Vous avez retiré ${remote.pseudo} de votre liste d'amis`,
    })
    transmit.broadcast(`users/${local.id}/friends`, {
      event: 'friendshipDeleted',
      data: { userId: remote.id },
    })
    transmit.broadcast(`users/${remote.id}/friends`, {
      event: 'friendshipDeleted',
      data: { userId: local.id },
    })

  }
}
