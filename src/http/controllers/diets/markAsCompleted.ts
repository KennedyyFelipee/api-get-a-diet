import { ResourceNotFoundError } from '@/services/errors/resource-not-found-error'
import { UnauthorizedError } from '@/services/errors/unauthorized-error'
import { makeMarkMealAsCompletedService } from '@/services/factories/make-mark-meal-as-completed'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function markAsCompleted(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const markMealAsCompletedbodySchema = z.object({
    title: z.string(),
  })

  const { title } = markMealAsCompletedbodySchema.parse(request.body)

  try {
    const createDietService = makeMarkMealAsCompletedService()

    const { mealMarked } = await createDietService.execute({
      title,
      userId: request.user.sub,
    })

    return reply.status(200).send({ mealMarked })
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return reply.status(401).send({ message: err.message })
    }
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}