import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { requestContext } from '../common/context';
import { CreateRedeemDto } from '../dto/redeem/createRedeem.dto';
import { CreateRequestMoneyDto } from '../dto/request/createRequest.dto';
import { IRequestContext } from '../interfaces/requestContext.interface';
import Redeem from '../models/redeem.model';
import Transaction, {
	TransactionAction,
	TransactionStatus,
	TransactionType,
} from '../models/transaction.model';
import { generateReemCode } from '../utils';
import TransactionService from './transaction.service';

@Service()
export default class RedeemService {
	constructor(
		private transactionService: TransactionService,

		@Inject(Redeem.name) private redeemModel: ModelClass<Redeem>
	) {}

	async create(redeemData: CreateRedeemDto): Promise<Redeem> {
		const { userId: senderId } = requestContext.getStore() as IRequestContext;
		const { chargeForSender, amount, note } = redeemData;
		const code = await this.genRedeemCode();

		// TODO refactory reuseable
		// check exist user
		const senderWallet = await this.transactionService.checkAccountExist(senderId);

		// calculate after charge
		const { sendAmount, receiveAmount, chargeFee } = this.transactionService.calculateAmount(
			amount,
			chargeForSender
		);

		if (senderWallet.balance < sendAmount)
			throw new HttpError(400, `The balance is not enough to make the transaction`);

		const newTransaction = await this.transactionService.create({
			senderId,
			amount,
			sendAmount,
			receiveAmount,
			charge: chargeFee,
			note,
			type: TransactionType.REDEEM,
		});

		await this.transactionService.startProcess(newTransaction, TransactionAction.CREATE_CODE);

		const redeem = await this.redeemModel.query().insert({
			transactionId: newTransaction.id,
			code,
		});

		return redeem;
	}

	async useCode(code: string): Promise<boolean> {
		// find redeem
		const redeem = await this.redeemModel.query().findOne({ code }).withGraphJoined('transaction');

		if (!redeem) throw new HttpError(404, 'Code is not available');
		if (!redeem.transaction) throw new HttpError(404, 'Code is not available');

		// check code is used
		if (redeem.transaction.receiverId || redeem.transaction.status === TransactionStatus.SUCCESS)
			throw new HttpError(400, 'Code is used');

		// do transaction
		this.transactionService.startProcess(redeem.transaction, TransactionAction.USE_CODE);

		return true;
	}

	async genRedeemCode(): Promise<string> {
		// TODO define code is unique
		return generateReemCode();
	}
}
