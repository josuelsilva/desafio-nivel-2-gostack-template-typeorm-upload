import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Resquest {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Resquest): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionExists = await transactionsRepository.findOne(id);

    if (!transactionExists) {
      throw new AppError('Transaction not exists!', 404);
    }
    await transactionsRepository.delete([id]);
  }
}

export default DeleteTransactionService;
