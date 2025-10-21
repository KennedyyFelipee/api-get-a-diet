import { UsersRepository } from '@/repositories/users-repository'

export class CheckDaysInOffensiveService {
  
  constructor(private userRepository: UsersRepository) { }

  async execute(): Promise<void> {
    this.userRepository.checkDaysInOffensive()
  }
}
