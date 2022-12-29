import Transaction, { TransactionAction } from '../models/transaction.model';
import Wallet from '../models/wallet.model';

export interface ITransferData {
	senderWallet: Wallet;
	receiverWallet: Wallet;
	transactionData: Transaction;
	action: TransactionAction;
}

export interface ITransferSend {
	senderId: string;
	sendAmount: number;
	charge: number;
	createdAt: Date;
	transactionId: string;
}

export interface ITransferReceive {
	receiverId: string;
	receiveAmount: number;
	createdAt: Date;
	transactionId: string;
}
