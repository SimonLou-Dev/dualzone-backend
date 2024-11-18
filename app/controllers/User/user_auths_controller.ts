// import type { HttpContext } from '@adonisjs/core/http'

import SteamAuthService, { SteamUserFromApi } from '#services/steam_auth_service'
import { HttpContext } from '@adonisjs/core/http'
import { dd } from '@adonisjs/core/services/dumper'
import User from '#models/user'
import RoleService from '#services/playerManagement/role_service'
import Role from '#models/role'

export default class UserAuthsController {
  private steamAuthService: SteamAuthService

  constructor() {
    this.steamAuthService = new SteamAuthService({
      apiKey: '72D84F637AE8308316E575A086792BC5',
      realm: 'http://localhost:3333',
      returnUrl: 'http://localhost:3333/auth/steam/authenticate',
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

      //TODO redirect to frontend with token in url params


    } catch (e: any) {
      dd(e)
    }
  }

  private async checkUser(steamId: string): Promise<User | null> {
    return await User.findBy('steamId', steamId)
  }
}
