import { join } from 'path';
import { createLogger, Logger, LoggerOptions, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const options: LoggerOptions = {
	level: 'info',
	exitOnError: false,
	transports: [
		new DailyRotateFile({
			level: 'info',
			filename: join('src/logs', 'app-%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxFiles: '2d',
		}),
	],
};

const logger: Logger = createLogger(options);

export default logger;
