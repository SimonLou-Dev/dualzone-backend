// import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import Group from '#models/group'
import GroupService from "#services/System/GroupService";

export default class TestsController {
  async test() {
    const michelSteamId = '4563'
    const benoitSteamId = '87516'

    const michel = await User.firstOrCreate(
      {
        steamId: michelSteamId,
      },
      {
        pseudo: 'michel',
        steamToken: 'test',
        userImage: 'test',
      }
    )

    const benoit = await User.firstOrCreate(
      {
        steamId: benoitSteamId,
      },
      {
        pseudo: 'Benoit',
        steamToken: 'test',
        userImage: 'test',
      }
    )
    let group = await GroupService.createGroup(michel)
    return group
  }
}
