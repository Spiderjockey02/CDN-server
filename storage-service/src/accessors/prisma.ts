import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils';
const LoggerClass = new Logger();

const client = new PrismaClient({ errorFormat: 'pretty',
	log: [
		{ level: 'info', emit: 'event' },
		{ level: 'warn', emit: 'event' },
		{ level: 'error', emit: 'event' },
	],
});

client.$on('info', (data) => {
	LoggerClass.log(data.message);
});

client.$on('warn', (data) => {
	LoggerClass.warn(data.message);
});

client.$on('error', (data) => {
	LoggerClass.error(data.message);
});

const extendedClient = client.$extends({
	query: {
		$allModels: {
			async $allOperations({ model, operation, args, query }) {
				const startTime = Date.now();
				const result = await query(args);
				const timeTook = Date.now() - startTime;

				LoggerClass.debug(`Query ${model}.${operation} took ${timeTook}ms`);
				return result;
			},
		},
	},
});

export default extendedClient;
