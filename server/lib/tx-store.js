import Logger from '../helpers/logger';

const conditionalTransactions = {};

const MIN_BOUNTY = 1000000000000000;

export function getAll() {
  return Object.values(conditionalTransactions).map(id => ({
    ...conditionalTransactions[id],
    id,
  }));
}

export function get(id) {
  return conditionalTransactions[id];
}

export function addTx(error, event) {
  if (error) {
    Logger.error({
      at: 'tx-store#addTx',
      message: 'event error thrown',
      error,
    });
    return;
  }

  if (event.bounty < MIN_BOUNTY) {
    Logger.info({
      at: 'tx-store#addTx',
      message: 'Ignoring tx with low bounty',
      id: event.id,
      bounty: event.bounty,
    });
    return;
  }

  if (conditionalTransactions[event.id]) {
    return;
  }

  conditionalTransactions[event.id] = {
    to: event.to,
    functionSignature: event.functionSignature,
    data: event.data,
  };
}

export function removeTx(error, event) {
  if (error) {
    Logger.error({
      at: 'tx-store#removeTx',
      message: 'event error thrown',
      error,
    });
    return;
  }

  Logger.info({
    at: 'tx-store#removeTx',
    message: 'Removing executed tx',
    id: event.id,
  });

  delete conditionalTransactions[event.id];
}
