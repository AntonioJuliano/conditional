import Logger from '../helpers/logger';

export default (request, response, next) => {
  Logger.info({
    at: 'requestLogger#logRequest',
    message: 'Received request',
    url: request.url,
    method: request.method,
    headers: request.headers,
    query: request.query,
    body: request.body,
  });

  return next();
};
