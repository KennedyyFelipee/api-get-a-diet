import { FirestoreUsersRepository } from '@/repositories/firestore/firestore-users-repository' 
import { UsersRepository } from '@/repositories/users-repository'

export function makeUsersRepository(): UsersRepository {
  const usersRepository = new FirestoreUsersRepository()
  return usersRepository
}
