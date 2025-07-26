/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import transmit from '@adonisjs/transmit/services/main'
const MatchController = () => import('#controllers/match_controller')
const TicketsController = () => import('#controllers/tickets_controller')
const FriendsController = () => import('#controllers/friends_controller')
const UserAuthController = () => import('#controllers/User/user_auth_controller')
const UserResourceController = () => import('#controllers/User/user_resource_controller')
const UserSanctionController = () => import('#controllers/User/user_sanction_controller')
const DemoController = () => import('#controllers/demo/demo_controller')
const UserRankController = () => import('#controllers/User/user_rank_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

transmit.registerRoutes((route) => {
  //Ensure you are authenticated before accessing the route
  if (route.getPattern() === '__transmit/subscribe') {
    route.use(middleware.auth({
      guards: ['api'],
    }))
    return
  }
})

router.get('/auth/steam/authenticate', [UserAuthController, 'steamCallback'])
router.get('/auth/steam', [UserAuthController, 'steamAuth'])
router.get('/auth', [UserAuthController, 'current']).use(
  middleware.auth({
    guards: ['api'],
  })
)

// Users
router
  .group(() => {
    router.get('/users', [UserResourceController, 'index'])
    router.get('/users/:id', [UserResourceController, 'show'])
    router.delete('/users/', [UserResourceController, 'destroy'])
    router.put('/users/:id', [UserResourceController, 'update'])

    router.get('/user/groups', [UserAuthController, 'currentGroup'])
  })
  .use(middleware.auth())

// Tickets
router
  .group(() => {
    router.get('/tickets', [TicketsController, 'index'])
    router.post('/tickets', [TicketsController, 'store'])
    router.get('/tickets/:id', [TicketsController, 'show'])
    router.put('/tickets/:id/message', [TicketsController, 'postMessage'])
    router.put('/tickets/:id/add-member', [TicketsController, 'addMember'])
    router.patch('/tickets/:id', [TicketsController, 'close'])
  })
  .use(middleware.auth())

// Friends
router
  .group(() => {
    router.get('/friends', [FriendsController, 'index'])
    router.post('/friends', [FriendsController, 'store'])
    router.patch('/friends/:id', [FriendsController, 'accept'])
    router.delete('/friends/:id', [FriendsController, 'destroy'])
  })
  .use(middleware.auth())

//Sanctions
router
  .group(() => {
    router.get('/users/:userId/sanctions', [UserSanctionController, 'listSanction'])
    router.post('/users/:userId/sanctions/warn', [UserSanctionController, 'warn'])
    router.post('/users/:userId/sanctions/ban', [UserSanctionController, 'ban'])
    router.put('/sanctions/:sanctionId', [UserSanctionController, 'update'])
    router.delete('/sanctions/:sanctionId', [UserSanctionController, 'delete'])
  })
  .use(middleware.auth())

// Match management
router
  .group(() => {
    router.post('/match/enqueue/:modeId', [MatchController, 'request']) // Enqueue the group to MM of gamemode
    router.get('/match/party/:partyId', [MatchController, 'get_party']) // Get party info
    router.get('/match/status', [MatchController, 'status']) // Get current user party status

    //Get game modes
    router.get('/modes/cs2', [MatchController, 'getGameMode'])

    //Get last parties by game mode
    router.get('/parties/:modeId', [MatchController, 'listPartiesByGameMode'])

    //Get classement
    router.get('/ranks/:gameId', [UserRankController, 'getClassement'])
    router.get('/rank/:gameId', [UserRankController, 'ownRank'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.post('/demo/matchmaking/randomplayer/:modeId', [DemoController, 'force_found_match']) // Force match creation
    router.post('/demo/matchmaking/resolveduo/:modeId', [DemoController, 'force_resolve_mm']) // Resolving all combinations of the game mode in MM queue

    router.post('/demo/random_result', [DemoController, 'generate_random_rslt']) // Force match end and score update


    router.post('/demo/force/score', [DemoController, 'force_update_match_score']) // Update match score

    router.post('/demo/force/status/choose', [DemoController, 'force_match_choice']) // Force status choose
    router.post('/demo/force/status/warmup', [DemoController, 'force_warmup_start']) // Force warmup start
    router.post('/demo/force/status/play', [DemoController, 'force_match_play']) // Force warmup start
    router.post('/demo/force/status/end', [DemoController, 'force_end_match']) // Force warmup start
  })
  .use(middleware.auth())
