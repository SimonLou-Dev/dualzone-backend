import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'

export default class UserRolesChanged extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(user: User) {
    super()
  }
}
