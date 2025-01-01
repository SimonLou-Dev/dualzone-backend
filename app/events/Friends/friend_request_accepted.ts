import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'
import transmit from '@adonisjs/transmit/services/main'

export default class FriendRequestAccepted extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public local: User,
    public remote: User
  ) {
    super()
    transmit.broadcast(`users/${remote.id}/notify`, {
      message: `Votre demande d'ami avec ${local.pseudo} a été acceptée`,
    })
    transmit.broadcast(`users/${local.id}/notify`, {
      message: `Vous avez accepté la demande d'amis de  ${remote.pseudo}`,
    })
    transmit.broadcast(`users/${local.id}/friends`, {
      event: 'friendRequestAccepted',
      data: { userId: remote.id },
    })
    transmit.broadcast(`users/${remote.id}/friends`, {
      event: 'friendRequestAccepted',
      data: { userId: local.id },
    })

  }
}
