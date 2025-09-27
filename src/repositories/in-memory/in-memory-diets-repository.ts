import { randomUUID } from 'node:crypto'
import { Diet, DietCreateInput } from '../../@types'
import { DietsRepository } from '../diets-repository'

export class InMemoryDietsRepository implements DietsRepository {
  private items: Diet[] = []

   async findAll(): Promise<Diet[]> {
    return this.items
  }

  async getAll(): Promise<Diet[] | null> {
    if (this.items.length > 0) {
      return this.items
    }

    return null
  }

  async findById(id: string): Promise<Diet | null> {
    const diet = this.items.find((item) => item.id === id)

    if (!diet) {
      return null
    }

    return diet
  }

  async findByAuthorId(author_id: string): Promise<Diet | null> {
    const diet = this.items.find((item) => item.author_id === author_id)

    if (!diet) {
      return null
    }

    return diet
  }

  async create(data: DietCreateInput): Promise<Diet> {
    const diet: Diet = {
      id: randomUUID(),
      title: data.title,
      meals: data.meals,
      author_id: data.author_id,
      author_name: data.author_name,
      orientations: data.orientations ?? null,
    }

    this.items.push(diet)

    return diet
  }
}
