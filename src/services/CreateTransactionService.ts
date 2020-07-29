import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    let categoryTransaction: Category;

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const { total } = await transactionsRepository.getBalance();

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('type is invalid.');
    }

    if (type === 'outcome' && value > total) {
      throw new AppError('Insufficient balance to confirm this transaction.');
    }

    const categoryRepository = getRepository(Category);
    const categoryTransactionExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryTransactionExists) {
      const categorySave = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categorySave);
      categoryTransaction = categorySave;
    } else {
      categoryTransaction = categoryTransactionExists;
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: categoryTransaction,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
