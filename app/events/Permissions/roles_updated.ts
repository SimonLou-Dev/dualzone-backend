import { BaseEvent } from '@adonisjs/core/events'
import Role from '#models/role'

export default class RolesUpdated extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public role: Role) {
    super()
  }
}
