import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { hash, compare } from 'bcryptjs'
import { makeUsersRepository } from '../../../services/factories/make-users-repository'
import { ResourceNotFoundError } from '@/services/errors/resource-not-found-error'
import { FirestoreUsersRepository } from '../../../repositories/firestore/firestore-users-repository'

export async function changePassword(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    old_password: z.string().min(6),
    new_password: z.string().min(6)
  })

  const { old_password, new_password } = bodySchema.parse(request.body)
  const userId = request.user.sub // vem do token JWT

  const usersRepository = makeUsersRepository()
  const user = await usersRepository.findById(userId)

  if (!user) {
    throw new ResourceNotFoundError()
  }

  const passwordMatches = await compare(old_password, user.password_hash)
  if (!passwordMatches) {
    return reply.status(400).send({ message: 'Senha atual incorreta' })
  }

  const newPasswordHash = await hash(new_password, 8)

  await usersRepository.updatePassword(user.id, newPasswordHash)

  return reply.status(200).send({ message: 'Senha alterada com sucesso' })
}
