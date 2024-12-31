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
const UserAuthController = () => import('#controllers/User/user_auth_controller')
const UserResourceController = () => import('#controllers/User/user_resource_controller')

router.get('/', async () => {

  return {
    hello: 'world',
  }
})

transmit.registerRoutes((route) => {
  //Ensure you are authenticated before accessing the route
  if (route.getPattern() === '__transmit/subscribe') {
    route.use(middleware.auth())
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

router.resource('users', UserResourceController).apiOnly().use('*', middleware.auth())
