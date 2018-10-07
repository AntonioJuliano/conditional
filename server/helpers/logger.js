import winston from 'winston';
import { StackTransport } from './stack-transport';

const dev = process.env.NODE_ENV === 'development';
const test = process.env.NODE_ENV === 'test';

const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf((info) => {
    const {
      timestamp, level, ...args
    } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${Object.keys(args).length
      ? JSON.stringify(args, null, 2) : ''}`;
  }),
);

const transports = [];

if (dev || test) {
  transports.push(
    new StackTransport({
      level: 'error',
      handleExceptions: true,
    }),
  );
}

if (!test || process.env.LOGS) {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: (dev || test) ? alignedWithColorsAndTime : undefined,
    }),
  );
}

const Logger = winston.createLogger({
  transports,
  exitOnError: false,
});

export default Logger;
