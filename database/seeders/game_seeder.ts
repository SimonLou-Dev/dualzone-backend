import Game from '#models/game'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import GameMode from '#models/game_mode'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries in this method
    const game = await Game.create({
      name: 'cs2',
      description: 'Un jeu pvp',
    })

    await GameMode.createMany([
      {
        name: '1v1',
        description: 'Partie en 1v1 (classé)',
        gameId: game.id,
      },
      {
        name: '2v2',
        description: 'Partie en 2v2 (classé)',
        gameId: game.id,
      },
    ])
  }
}
