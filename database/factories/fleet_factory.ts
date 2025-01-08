import factory from '@adonisjs/lucid/factories'
import Fleet from '#models/fleet'

export const FleetFactory = factory
  .define(Fleet, async () => {
    return {}
  })
  .build()
