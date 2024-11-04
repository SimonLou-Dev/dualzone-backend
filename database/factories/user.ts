import Factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = Factory.define(User, async ({ faker }) => {
  return {
    userImage: faker.image.avatar(),
    pseudo: faker.internet.username(),
    steamId: faker.string.hexadecimal({ length: 18 }),
    steamToken: faker.string.alphanumeric({ length: 20 }),
  }
}).build()
