// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserRank from '#models/user_rank'

export default class UserRankController {
  async ownRank({ response, auth, params }: HttpContextContract) {
    //Weed need to return user with rank and number of games played and place
    //Also return a paginated and ordered list of users with rank and number of games played

    const user = auth.getUserOrFail()

    //Get user rank and place
    const rank: UserRank = await UserRank.query()
      .where('game_id', params.gameId)
      .andWhere('user_id', user.id)
      .firstOrFail()

    //Count how many player have greater
    const betterThanCount = await UserRank.query().where('rank', '>', rank.rank).count('* as total')
    const totalCount = await UserRank.query().where('game_id', params.gameId).count('* as total')
    const position = Number(betterThanCount[0].$extras.total) + 1
    const total = Number(totalCount[0].$extras.total)

    return response.json({
      elo: rank.rank,
      rank: position,
      total,
    })
  }

  async getClassement({ response, auth, request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = request.input('row', 20)
    await auth.getUserOrFail()

    const baseQuery = await UserRank.query()
      .preload('user')
      .orderBy('rank', 'desc')
      .paginate(page, perPage)

    const globalOffset = (page - 1) * perPage

    const players = baseQuery.serialize().data.map((entry, index) => {
      return {
        user: entry.user,
        elo: entry.rank,
        rank: globalOffset + index + 1,
      }
    })

    return response.json({
      meta: baseQuery.getMeta(),
      data: players,
    })
  }
}
