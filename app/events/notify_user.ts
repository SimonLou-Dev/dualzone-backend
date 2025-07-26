import User from '#models/user'
import transmit from '@adonisjs/transmit/services/main'
import { BaseEvent } from '@adonisjs/core/events'

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export default class NotifyUser extends BaseEvent {
  constructor(
    public user: User,
    public message: string,
    public type: NotificationType = NotificationType.INFO
  ) {
    super()

    transmit.broadcast(`users/${user.id}/notify`, {
      message: message,
      type: type,
    })
  }
}
