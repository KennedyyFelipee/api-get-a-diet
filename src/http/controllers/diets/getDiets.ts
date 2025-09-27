import { makeGetDietsService } from '@/services/factories/make-get-diets-service'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function getDiets(request: FastifyRequest, reply: FastifyReply) {
  const getDietsService = makeGetDietsService()

  const diets = await getDietsService.execute()

  return reply.status(200).send(diets)
}