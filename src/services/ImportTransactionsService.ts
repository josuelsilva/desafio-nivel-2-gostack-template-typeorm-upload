import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: string;
  value: number;
  category: string;
}
class ImportTransactionsService {
  public async execute({ transactionsFileImport }): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepositoy = getRepository(Category);
    const concactsReadStream = fs.createReadStream(transactionsFileImport);

    const parsers = csvParse({
      from_line: 2,
    });

    const parseCSV = concactsReadStream.pipe(parsers);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value: parseFloat(value), category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));
    // console.log({ categories, transactions });
    const existentCategories = await categoriesRepositoy.find({
      where: In(categories),
    });

    console.log(existentCategories);
  }
}

export default ImportTransactionsService;
