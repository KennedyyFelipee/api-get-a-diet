import {
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  UserCreateInput,
  User,
  MarkMealAsCompletedInput,
  Meal,
  setUserDietInput,
} from '../../@types'
import { firestore } from '../../lib/firebase'
import { UsersRepository } from '../users-repository'
import { randomUUID } from 'node:crypto'
import { ResourceNotFoundError } from '@/services/errors/resource-not-found-error'

export class FirestoreUsersRepository implements UsersRepository {
  async setUserDiet(data: setUserDietInput): Promise<User | null> {
    const user = await this.findById(data.userId)

    if (!user) {
      return null
    }

    user.diet = data.diet

    await updateDoc(doc(firestore.users, user.id), user)

    return user
  }

  async markMealAsCompleted(data: MarkMealAsCompletedInput): Promise<Meal> {
    const user = await this.findById(data.userId)

    if (!user || !user.diet) {
      throw new ResourceNotFoundError()
    }
    const mealToMark = user.diet.meals.find((meal) => meal.title === data.title)

    if (!mealToMark) {
      throw new ResourceNotFoundError()
    }

    mealToMark.completed = new Date()

    await updateDoc(doc(firestore.users, user.id), user)

    return mealToMark
  }

  async checkDaysInOffensive(): Promise<void> {
    const searchQuery = query(firestore.users)

    const querySnapshot = await getDocs(searchQuery)
    const usersSnapshot = querySnapshot.docs

    if (usersSnapshot.length > 0) {
      usersSnapshot.forEach(async (snapshot) => {
        const user = snapshot.data()

        if (user.diet) {
          const isAllMealsCompleted = user.diet.meals.every(
            (meal) => meal.completed,
          )

          if (!isAllMealsCompleted) {
            user.days_in_offensive = 0
          } else {
            user.days_in_offensive += 1
          }

          user.diet.meals.forEach((meal) => (meal.completed = null))

          await updateDoc(doc(firestore.users, user.id), user)
        }
      })
    }
  }

  async findById(id: string): Promise<User | null> {
    const searchQuery = query(firestore.users, where('id', '==', id))

    const querySnapshot = await getDocs(searchQuery)
    const userSnapshot = querySnapshot.docs

    if (userSnapshot.length === 0) {
      return null
    }

    const user = userSnapshot[0].data()

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const searchQuery = query(firestore.users, where('email', '==', email))

    const querySnapshot = await getDocs(searchQuery)
    const userSnapshot = querySnapshot.docs

    if (userSnapshot.length === 0) {
      return null
    }

    const user = userSnapshot[0].data()

    return user
  }

  async create(data: UserCreateInput): Promise<User> {
    const id = randomUUID()

    const user: User = {
      id,
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      image_url: null,
      crn: data.crn ?? null,
      diet: null,
      days_in_offensive: 0,
    }

    await setDoc(doc(firestore.users, id), user)

    return user
  }

  //funcion para atualizar a senha do usuário
  
  async updatePassword(id: string, newPasswordHash: string): Promise<void> {
    await updateDoc(doc(firestore.users, id), { password_hash: newPasswordHash })
  }
}