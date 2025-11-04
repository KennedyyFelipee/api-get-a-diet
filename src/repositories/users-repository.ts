import {
  MarkMealAsCompletedInput,
  Meal,
  User,
  UserCreateInput,
  setUserDietInput,
} from '../@types'

export interface UsersRepository {
  updatePassword(id: string, newPasswordHash: string): unknown
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  checkDaysInOffensive(): Promise<void>
  markMealAsCompleted(data: MarkMealAsCompletedInput): Promise<Meal>
  setUserDiet(data: setUserDietInput): Promise<User | null>
  create(data: UserCreateInput): Promise<User>
}
