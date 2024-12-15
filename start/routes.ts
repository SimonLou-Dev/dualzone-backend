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
const UserAuthController = () => import('#controllers/User/user_auth_controller')
const UserResourceController = () => import('#controllers/User/user_resource_controller')

router.get('/', async () => {
  return {
    hello: 'world',
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
