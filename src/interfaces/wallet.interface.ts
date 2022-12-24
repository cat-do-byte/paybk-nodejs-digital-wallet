export interface IWalletSent {
	senderId: string;
	receiverId: string;
	amount: number;
	chargeForSender?: boolean;
	note?: string;
}
