import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'
import transmit from '@adonisjs/transmit/services/main'

export default class FriendRequestSent extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public user: User,
    public friend: User
  ) {
    super()
    transmit.broadcast(`users/${user.id}/notify`, {
      message: 'Votre demande d`amitié a été envoyée',
    })
    transmit.broadcast(`users/${friend.id}/notify`, {
      message: `Vous avez reçu une demande d'ami de ${user.pseudo}`,
    })
    transmit.broadcast(`users/${user.id}/friends`, {
      event: 'friendRequestSent',
      data: { friendId: friend.id },
    })
    transmit.broadcast(`users/${friend.id}/friends`, {
      event: 'friendRequestReceived',
      data: { userId: user.id },
    })

  }
}
