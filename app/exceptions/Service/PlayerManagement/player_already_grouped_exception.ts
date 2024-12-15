import { Exception } from '@adonisjs/core/exceptions'
import User from '#models/user'

export default class PlayerAlreadyGroupedException extends Exception {
  constructor(player: User) {
    super(`Player ${player.id} is already grouped`)
  }

  static status = 500
}
