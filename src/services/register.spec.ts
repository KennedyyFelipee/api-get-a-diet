import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { RegisterService } from './register'
import { compare } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { InMemoryDietsRepository } from '@/repositories/in-memory/in-memory-diets-repository'

let usersRepository: InMemoryUsersRepository
let sut: RegisterService

beforeEach(() => {
  usersRepository = new InMemoryUsersRepository()
  sut = new RegisterService(usersRepository)
})

describe('Register Service', () => {
  it('should be able to register.', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      crn: null,
    })

    expect(user.id).toEqual(expect.any(String))
    expect(user).toStrictEqual({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
      image_url: null,
      password_hash: expect.any(String),
      crn: null,
      diet: null,
      days_in_offensive: 0,
    })
  })

  it('should hash user password upon registration.', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      crn: null,
    })

    const isPasswordCorrectlyHashed = await compare(
      '123456',
      user.password_hash,
    )

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should not be able to register with same email twice.', async () => {
    const email = 'johndoe@example.com'

    await sut.execute({
      name: 'John Doe',
      email,
      password: '123456',
      crn: null,
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email,
        password: '123456',
        crn: null,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
