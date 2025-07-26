import { Exception } from '@adonisjs/core/exceptions'
import User from '#models/user'

export default class PlayerIsNotGroupedException extends Exception {
  public constructor(player: User) {
    super(`Player ${player.id} isn't grouped`)
  }

  static status = 500
}
