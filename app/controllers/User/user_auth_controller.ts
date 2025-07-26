// import type { HttpContext } from '@adonisjs/core/http'

import SteamAuthService, { SteamUserFromApi } from '#services/steam_auth_service'
import { HttpContext } from '@adonisjs/core/http'
import { dd } from '@adonisjs/core/services/dumper'
import User from '#models/user'
import RoleService from '#services/playerManagement/role_service'
import Role from '#models/role'
import env from '#start/env'
import { AccessToken } from '@adonisjs/auth/access_tokens'
// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PermissionService from '#services/playerManagement/permission_service'
import GroupService from '#services/playerManagement/group_service'

export default class UserAuthController {
  private steamAuthService: SteamAuthService

  constructor() {
    this.steamAuthService = new SteamAuthService({
      apiKey: env.get('STEAM_API_KEY'),
      realm: env.get('STEAM_REALM_NAME'),
      returnUrl: env.get('STEAM_CALLBACK_URL'),
    })
  }

  public async steamAuth(context: HttpContext) {
    let redirect = await this.steamAuthService.getRedirectUrl()
    return context.response.redirect().toPath(redirect)
  }

  public async steamCallback(context: HttpContext) {
    try {
      const steamUser: SteamUserFromApi = await this.steamAuthService.authenticate(context.request)
      let findedUser: User | null = await this.checkUser(steamUser.steamid)
      if (findedUser === null) {
        findedUser = new User()
        findedUser.userImage = steamUser.avatar.medium
        findedUser.steamId = steamUser.steamid
        findedUser.pseudo = steamUser.username
        findedUser = await findedUser.save()

        const userRole = await Role.findBy('name', 'user')
        if (userRole === null) throw new Error('Role not found')

        await RoleService.setUserRole(findedUser, userRole)
      }

      const token = await User.accessTokens.create(findedUser)
      const url = env.get('FRONT_APP_URL') + '?token=' + token.value!.release()

      await findedUser.load('group')
      if (findedUser.group.length === 0) await GroupService.createGroup(findedUser)

      return context.response.redirect().toPath(url)
    } catch (e: any) {
      dd(e)
    }
  }

  private async checkUser(steamId: string): Promise<User | null> {
    return await User.findBy('steamId', steamId)
  }

  public async current({ response, auth }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    let token = await UserAuthController.updateTokenExpiry(auth.user!.currentAccessToken, user)
    user.load('friends')
    const permissions: string[] = await PermissionService.getAllUserPermsString(user)
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

  async currentGroup({ response, auth }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    await user.load('group')
    return user.group ? response.json(user.group) : response.notFound({ message: 'Group not found' })
  }

}
