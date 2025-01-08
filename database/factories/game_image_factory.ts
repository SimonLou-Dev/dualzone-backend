import factory from '@adonisjs/lucid/factories'
import GameImage from '#models/game_image'

export const GameImageFactory = factory
  .define(GameImage, async () => {
    return {}
  })
  .build()
