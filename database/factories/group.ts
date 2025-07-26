import Factory from '@adonisjs/lucid/factories'
import Group from '#models/group'
import { UserFactory } from '#database/factories/user'

export const GroupFactory = Factory.define(Group, ({ faker }) => {
  return {
    size: faker.number.int({ min: 1, max: 5 }),
    id: faker.string.uuid(),
  }
})
  .relation('leader', () => UserFactory)
  .relation('members', () => UserFactory)
  .build()
