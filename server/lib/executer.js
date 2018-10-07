import { getAll } from './tx-store';
import conditional from './conditional';
import Logger from '../helpers/logger';
import delay from '../helpers/delay';
import { EXECUTER_INTERVAL_MS, ACCOUNT } from '../helpers/constants';

export async function start() {
  for (;;) {
    const txs = getAll();
    const isExecutable = await Promise.all(
      txs.map(tx => conditional.methods.isExecutable(tx.id).call()),
    );

    for (let i = 0; i < txs.length; i += 1) {
      if (isExecutable[i]) {
        execute(txs[i]);
      }
    }

    await delay(EXECUTER_INTERVAL_MS);
  }
}

async function execute(tx) {
  Logger.info({
    at: 'executer#execute',
    message: 'Executing transaction',
    id: tx.id,
  });

  return conditional.methods.executeTx(
    tx.id,
    tx.to,
    tx.functionSignature,
    tx.data,
  ).send({ from: ACCOUNT });
}
