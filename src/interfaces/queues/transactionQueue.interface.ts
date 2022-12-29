import Transaction, { TransactionAction } from '../../models/transaction.model';
import Voucher from '../../models/voucher.model';

export interface ITransactionQueue {
	transaction: Transaction;
	action?: TransactionAction;
	voucher?: Voucher;
}
