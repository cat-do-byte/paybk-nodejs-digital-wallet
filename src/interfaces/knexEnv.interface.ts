export enum IConfigEnv {
	DEVELOPMENT = 'development',
	PRODUCTION = 'production',
}
export type IKnexConfig = {
	[key in IConfigEnv]: any;
};
