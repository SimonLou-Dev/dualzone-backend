import { Exception } from '@adonisjs/core/exceptions'
import User from '#models/user'

export default class PlayerIsNotInSameGroupException extends Exception {
  public constructor(player: User) {
    super(`Player ${player.id} is isn't in same group`)
  }

  static status = 500
}
