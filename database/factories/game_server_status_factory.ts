import factory from '@adonisjs/lucid/factories'
import GameServerStatus from '#models/game_server_status'

export const GameServerStatusFactory = factory
  .define(GameServerStatus, async () => {
    return {}
  })
  .build()
