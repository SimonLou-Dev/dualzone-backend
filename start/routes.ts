/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const TestsController = () => import('#controllers/tests_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/test', [TestsController, 'test'])
