import { FastifyInstance } from 'fastify'
import { register } from './register'
import { authenticate } from './authenticate'
import { profile } from './profile'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { refresh } from './refresh'
import { checkCRN } from './checkCRN'
import { signOut } from './sign-out'
import { setNewDiet } from './setNewDiet'
import { changePassword } from './change-password'

export async function usersRoute(app: FastifyInstance) {
  console.log('Registering usersRoute...')
  app.post('/users', register)
  app.post('/sessions', authenticate)
  app.post('/verify/crn', checkCRN)

  app.patch('/token/refresh', refresh)
  app.delete('/sessions', signOut)
  /* Authenticated */
  app.get('/me', { onRequest: [verifyJWT] }, profile)
  app.put('/set-new-diet', { onRequest: [verifyJWT] }, setNewDiet)

  /*alterar senha*/
  app.patch('/users/password', { onRequest: [verifyJWT] }, changePassword)
}
