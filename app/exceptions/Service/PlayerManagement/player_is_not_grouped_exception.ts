import { Exception } from '@adonisjs/core/exceptions'
import User from '#models/user'

export default class PlayerIsNotGroupedException extends Exception {
  private _player: User

  public constructor(player: User) {
    super()
    this._player = player
  }

  static status = 500
}
