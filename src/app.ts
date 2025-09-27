import fastify from 'fastify'
import { usersRoute } from './http/controllers/users/routes'
import { ZodError } from 'zod'
import { env } from './env'
import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import { dietsRoute } from './http/controllers/diets/routes'
import fastifyCors from '@fastify/cors'

import nodecron from 'node-cron'
import { makeCheckDaysInOffensiveService } from './services/factories/make-check-days-in-offensive-service'

export const app = fastify()

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'get-a-diet.refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '10m',
  },
})

app.register(fastifyCookie)

app.register(usersRoute)
app.register(dietsRoute)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.format(),
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Here we should log to an external tool like DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})

/* Triggers the checking and validation function of offensive days */
const everyDayAtTwentyThreeAndFiftyNinePM = '59 59 23 * * *'

nodecron.schedule(
  everyDayAtTwentyThreeAndFiftyNinePM,
  () => {
    console.log('cron-job executed')
    const checkDaysInOffensive = makeCheckDaysInOffensiveService()

    checkDaysInOffensive.execute()
  },
  {
    name: 'Checking and validation function of offensive days.',
    timezone: 'America/Sao_Paulo',
  },
)