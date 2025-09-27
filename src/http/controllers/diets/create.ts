import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UnauthorizedError } from '@/services/errors/unauthorized-error'
import { makeCreateDietService } from '@/services/factories/make-create-diet-service'
import { makeUsersRepository } from '@/services/factories/make-users-repository' 

export async function create(request: FastifyRequest, reply: FastifyReply) {

  console.log('🔍 Requisição recebida:', request.body) //TESTEEEEEEEEEEEEEEEEE
  console.log('🔐 Usuário autenticado:', request.user.sub)

  const mealItemSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    quantity: z.coerce.number(),
    unit: z.string().min(1),
  })

  const mealSchema = z.object({
    title: z.string().min(1),
    items: z.array(mealItemSchema).nonempty(),
    completed: z.any().optional(), // será normalizado
  })

  const createDietBodySchema = z.object({
    title: z.string().min(1),
    meals: z.array(mealSchema).nonempty(),
  })

  const { title, meals } = createDietBodySchema.parse(request.body)

  const usersRepository = makeUsersRepository()
  const user = await usersRepository.findById(request.user.sub)

  if (!user) {
    throw new UnauthorizedError()
  }


  const normalizedMeals = meals.map((meal) => ({
    title: meal.title,
    completed: null,
    items: meal.items.map((item) => ({
      name: item.name,
      description: item.description ?? null,
      quantity: item.quantity,
      unit: item.unit,
    })),
  }))

  const createDietService = makeCreateDietService()
  const { diet } = await createDietService.execute({
    title,
    meals: normalizedMeals,
    author_id: user.id,
  })

  await usersRepository.setUserDiet({
    userId: user.id,
    diet, // agora sim: tipo Diet
  })

  return reply.status(201).send({ diet })

}
