// import type { HttpContext } from '@adonisjs/core/http'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '#models/user'
import {dd} from "@adonisjs/core/services/dumper";

export default class UserController {
  public show({ params, request, session, response }: HttpContextContract) {

    dd(request)
    //TODO check if user is authed and return


  }
    /*const token = await User.accessTokens.create(findedUser)
    findedUser.load('friends')
    const permissions: string[] = []

    return {
      redirect: null,
      token: {
        type: 'bearer',
        value: token.value!.release(),
      },
      permissions,
      findedUser,
    }
  }*/
}
