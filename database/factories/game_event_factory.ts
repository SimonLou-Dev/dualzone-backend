import factory from '@adonisjs/lucid/factories'
import GameEvent from '#models/game_event'

export const GameEventFactory = factory
  .define(GameEvent, async () => {
    return {}
  })
  .build()
