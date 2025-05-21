import User from '#models/user'
import Group from '#models/group'
import Game from '#models/game'
import PartyTeam from '#models/party_team'
import UserRank from '#models/user_rank'

export default class RankService {
  public static async getTeamRank(
    group: Group,
    game: Game
  ): Promise<{ min: number; max: number; avg: number }> {
    let teamRank = 0
    let minRank = Infinity
    let maxRank = 0
    group.members.map(async (member) => {
      let rank = await this.getUserRank(member, game)
      if (rank.rank < minRank) minRank = rank.rank
      if (rank.rank > maxRank) maxRank = rank.rank
      teamRank += rank.rank
    })
    return { min: minRank, max: maxRank, avg: teamRank / group.members.length }
  }

  public static async calculateWinProbabilityOfTeamA(
    teamA: PartyTeam,
    teamB: PartyTeam
  ): Promise<number> {
    await teamA.load('players')
    await teamA.load('party')
    await teamA.party.load('mode')
    await teamA.party.mode.load('game')
    await teamB.load('players')
    let teamARank = 1
    let teamBRank = 1

    for (const member of teamA.players) {
      let rank = await this.getUserRank(member, teamA.party.mode.game)
      teamARank *= Math.pow(10, rank.rank / 1000)
    }

    for (const member of teamB.players) {
      let rank = await this.getUserRank(member, teamA.party.mode.game)
      teamBRank *= Math.pow(10, rank.rank / 1000)
    }

    return teamARank / (teamARank + teamBRank)
  }

  public static async calculateRank(
    user: User,
    game: Game,
    score: number,
    winProbability: number
  ): Promise<number> {
    await user.load('ranks')
    let rank = await this.getUserRank(user, game)
    let devCoef = 0

    if (rank.playedGames <= 5) devCoef = 350
    else if (rank.playedGames > 5 && rank.playedGames <= 30) devCoef = 200
    else devCoef = 100

    //Si le rank est plus petit que 2000 qu'il a de grande proba de perdre et qu'il score de fou on le monte un max
    if (rank.rank <= 2000 && score > 0.5 && winProbability < 0.1) devCoef *= 2

    //Si c'est un GOAT qui doit gagner et qui joue fàce à un caca et il perd, on le détruit
    else if (rank.rank >= 3000 && score <= 0.5 && winProbability > 0.9) devCoef *= 2

    //Si il a 3000 ou plus et qu'il gagne on nerf le gain
    else if (rank.rank >= 3000 && score > 0.5) devCoef /= 1.5

    const newRank = rank.rank + devCoef * (score - winProbability)
    const adjustedRank = this.reduceLostRank(rank, newRank)

    return Math.floor(adjustedRank)
  }

  private static reduceLostRank(rank: UserRank, next: number): number {
    if (rank.rank < next) return next
    if (next >= 1000) return next
    const diff = rank.rank - next

    return rank.rank - diff / 2
  }

  public static async getUserRank(user: User, game: Game): Promise<UserRank> {
    await user.load('ranks')
    let rank = user.ranks.find((r) => game.id === r.gameId)

    if (rank === undefined) return await this.createRank(user, game)
    return rank
  }

  public static async createRank(user: User, game: Game): Promise<UserRank> {
    let rank = new UserRank()
    rank.rank = 1000
    rank.playedGames = 0
    rank.gameId = game.id
    await user.related('ranks').save(rank)
    return rank
  }
}
