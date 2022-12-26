import Transaction, { TransactionAction } from '../models/transaction.model';
import Wallet from '../models/wallet.model';

export interface ITransferData {
	senderWallet: Wallet;
	receiverWallet: Wallet;
	transactionData: Transaction;
	action: TransactionAction;
}
