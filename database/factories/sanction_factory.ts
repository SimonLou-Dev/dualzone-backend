import factory from '@adonisjs/lucid/factories'
import Sanction from '#models/sanction'

export const SanctionFactory = factory
  .define(Sanction, async () => {
    return {}
  })
  .build()
