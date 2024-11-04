import factory from '@adonisjs/lucid/factories'
import UserRank from '#models/user_rank'

export const UserRankFactory = factory
  .define(UserRank, async ({ faker }) => {
    return {}
  })
  .build()