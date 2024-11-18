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
const UserController = () => import('#controllers/User/user_controller')
const UserAuthsController = () => import('#controllers/User/user_auths_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/auth/steam/authenticate', [UserAuthsController, 'steamCallback'])
router.get('/auth/steam', [UserAuthsController, 'steamAuth'])
router.get('/user/:id', [UserController, 'show']).use(
  middleware.auth({
    guards: ['api'],
  })
)
