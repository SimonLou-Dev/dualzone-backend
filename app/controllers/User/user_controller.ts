// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '#models/user'
import { AccessToken } from '@adonisjs/auth/access_tokens'

export default class UserController {
  public async show({ response, auth }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    let token = await UserController.updateTokenExpiry(auth.user!.currentAccessToken, user)
    user.load('friends')
    const permissions: string[] = []
    return response.json({
      token: {
        value: token === null ? token : token.value!.release(),
        type: 'bearer',
      },
      permissions,
      user,
    })
  }

  private static async updateTokenExpiry(
    accessToken: AccessToken,
    user: User
  ): Promise<AccessToken | null> {
    if (
      accessToken.expiresAt !== null &&
      accessToken.expiresAt <= new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
    )
      return await User.accessTokens.create(user)

    return null
  }
}
