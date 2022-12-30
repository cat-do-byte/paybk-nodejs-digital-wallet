import { Transaction as ObjectionTransaction } from 'objection';
import Transaction, { TransactionAction, TransactionStatus } from '../models/transaction.model';
import Wallet from '../models/wallet.model';

export interface ITransferData {
	senderWallet: Wallet;
	receiverWallet: Wallet;
	transactionData: Transaction;
	action: TransactionAction;
	trx?: ObjectionTransaction;
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

export interface IChangeStatus {
	transaction: Transaction | string;
	status: TransactionStatus;
	trx?: ObjectionTransaction;
}

export interface ITransactionTranfer {
	wallet: Wallet;
	transactionData: Transaction;
	isSend: boolean;
	trx?: ObjectionTransaction;
}
