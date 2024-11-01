import Factory from '@adonisjs/lucid/factories'
import Group from '#models/group'
import { UserFactory } from '#database/factories/user'

export const GroupFactory = Factory
  .define(Group, ({ faker }) => {
  return {
    size: 1,
  }
})
  .relation('leader', () => UserFactory)
  .relation('members', () => UserFactory)
  .build()
