import Transaction, { TransactionAction } from '../../models/transaction.model';

export interface ITransactionQueue {
	transaction: Transaction;
	action?: TransactionAction;
}
