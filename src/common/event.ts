import EventEmitter from 'events';

export const enum Events {
	USER_REGISTRATION = 'register_account',
}

export const eventEmitter = new EventEmitter();
