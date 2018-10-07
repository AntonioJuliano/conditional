/* eslint no-console: 0 */

import { validationResult } from 'express-validator/check';
import Logger from './logger';

export function handleIse(at, message, error, res) {
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }
  Logger.error({
    at,
    message,
    error,
  });
  res.sendStatus(500);
}

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
}
