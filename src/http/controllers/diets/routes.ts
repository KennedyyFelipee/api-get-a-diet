import { FastifyInstance } from 'fastify'
import { create } from './create'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyIfUserHasCRN } from '@/http/middlewares/verify-if-user-has-crn'
import { markAsCompleted } from './markAsCompleted'
import { getDiets } from './getDiets'

export async function dietsRoute(app: FastifyInstance) {
  app.get('/diets', getDiets)

  /* Authenticated */
  app.post('/diets', { onRequest: [verifyJWT, verifyIfUserHasCRN()] }, create)
  app.patch('/meal/markcompleted', { onRequest: [verifyJWT] }, markAsCompleted)
}