import factory from '@adonisjs/lucid/factories'
import Party from '#models/party'

export const PartyFactory = factory
  .define(Party, async ({ faker }) => {
    return {}
  })
  .build()