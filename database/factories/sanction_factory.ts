import factory from '@adonisjs/lucid/factories'
import Sanction from '#models/sanction'
import {UserFactory} from "#database/factories/user";

export const SanctionFactory = factory
  .define(Sanction, async ({ faker }) => {
    let admin = await UserFactory.create()

    return {
      reason: faker.lorem.sentence(),
      duration: faker.number.int({ min: 1, max: 20 }),
      type: 1,
      adminId: admin.id,
    }
  })
  .relation('user', () => UserFactory)
  .relation('admin', () => UserFactory)
  .state('warn', (sanction) => {
    sanction.type = 0
    sanction.duration = 0
  })
  .state('ban', (sanction) => {
    sanction.type = 1
  })
  .build()
