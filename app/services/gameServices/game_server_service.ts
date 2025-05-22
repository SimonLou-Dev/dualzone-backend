import redis from '@adonisjs/redis/services/main'
import Party from '#models/party'

const maps = [
  'de_dust2',
  'de_inferno',
  'de_nuke',
  'de_mirage',
  'de_overpass',
  'de_train',
  'de_ancient',
  'de_vertigo',
]

export default class GameServerService {
  public static async configureServer(party: Party): Promise<string> {
    await party.load('teams')
    const teams = party.teams
    const team1 = teams[0]
    const team2 = teams[1]
    await team1.load('players')
    await team2.load('players')

    const uuid = await this.getAvailableServers()
    const gameConfigKey = `gameserver:${uuid}:config`
    const gameVarsKey = `gameserver:${uuid}:vars`
    const team1Key = `gameserver:${uuid}:team1:config`
    const team2Key = `gameserver:${uuid}:team2:config`
    const team1PlayersKey = `gameserver:${uuid}:team1:players`
    const team2PlayersKey = `gameserver:${uuid}:team2:players`
    const spectatorsKey = `gameserver:${uuid}:spectators`
    const mapsKey = `gameserver:${uuid}:maps`

    await redis.del(
      gameConfigKey,
      gameVarsKey,
      team1Key,
      team2Key,
      team1PlayersKey,
      team2PlayersKey,
      spectatorsKey,
      mapsKey
    )

    await redis.hset(gameConfigKey, {
      id: Math.floor(Math.random() * 100 + 1).toString(),
      title: 'test',
      num_maps: Math.floor(Math.random() * maps.length),
      players_per_team: 1,
      min_players_to_ready: 1,
      clinch_series: 2,
      skip_veto: 'false',
      veto_first: 'random',
      side_type: 'always_knife',
    })

    await redis.hset(team1Key, { name: 'team1' })
    for (const player of team1.players) {
      await redis.hset(team1PlayersKey, player.steamId, player.pseudo)
    }

    await redis.hset(team2Key, { name: 'team2' })
    for (const player of team2.players) {
      await redis.hset(team2PlayersKey, player.steamId, player.pseudo)
    }

    await redis.hset(spectatorsKey, ' ', ' ')

    for (const map of maps) {
      await redis.lpush(mapsKey, map.toLowerCase())
    }

    await redis.hset(gameVarsKey, 'matchzy_kick_when_no_match_loaded', 'true')

    await redis.publish('gameserver:allocate', uuid)

    return uuid
  }

  public static async getAvailableServers(): Promise<string> {
    const allStatuses = await redis.hgetall('gameserver:status')

    const readyServers = Object.entries(allStatuses)
      .filter(([_, status]) => status === 'ready')
      .map(([uuid, _]) => uuid)

    if (readyServers.length > 0) {
      return readyServers[0]
    }

    return 'aaaaaaaa-0000-0000-0000-aaaaaaaaaaaa'
  }

}
