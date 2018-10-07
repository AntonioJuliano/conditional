import Logger from './helpers/logger';
import conditional from './lib/conditional';
import { addTx, removeTx } from './lib/tx-store';
import { start as startExecuter } from './lib/executer';

function run() {
  Logger.info({
    at: 'index#run',
    message: 'App starting',
  });

  conditional.events.TxAdded({}, addTx);
  conditional.events.TxExecuted({}, removeTx);
  conditional.events.CancelInitiated({}, removeTx);

  startExecuter();
}

run();
