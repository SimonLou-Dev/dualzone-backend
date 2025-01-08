import factory from '@adonisjs/lucid/factories'
import GameServer from '#models/game_server'

export const GameServerFactory = factory
  .define(GameServer, async () => {
    return {}
  })
  .build()
