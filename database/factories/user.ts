import User from '#models/user'
import { SanctionFactory } from '#database/factories/sanction_factory'
import factory from '@adonisjs/lucid/factories'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      userImage: faker.image.avatar(),
      pseudo: faker.internet.username(),
      steamId: faker.string.hexadecimal({ length: 18 }),
    }
  })
  .relation('sanctions', () => SanctionFactory)
  .build()
