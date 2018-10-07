import { getInputHash, getConditionalTxId, toBytes, executeTx, addTx } from '../src/utils';
import BN from 'bn.js';

web3.currentProvider.sendAsync = web3.currentProvider.send;
const { wait } = require('@digix/tempo')(web3);

const Conditional = artifacts.require('Conditional');
const AfterTimestampCondition = artifacts.require('AfterTimestampCondition');
const TestContract = artifacts.require('TestContract');

contract('Conditional', (accounts) => {
  it('works', async () => {
    const [
      conditional,
      afterTimestampCondition,
      testContract,
    ] = await Promise.all([
      Conditional.deployed(),
      AfterTimestampCondition.deployed(),
      TestContract.new(),
    ]);

    const [
      arg_1,
      arg_2,
      { timestamp: blockTimestamp },
    ] = await Promise.all([
      testContract.ARG_1.call(),
      testContract.ARG_2.call(),
      web3.eth.getBlock('latest'),
    ]);

    const inputHash = getInputHash(testContract, 'test', arg_1, arg_2);

    const nonce = 1;
    const delay = 300;
    const from = accounts[1];
    const bounty = new BN(4);
    const conditionData = toBytes([blockTimestamp + delay]);

    const resp = await addTx(
      conditional,
      testContract,
      'test',
      from,
      afterTimestampCondition.address,
      conditionData,
      nonce,
      bounty,
      arg_1,
      arg_2,
    );

    const { id } = resp;
    console.log('\tConditional#addTx gas cost:', resp.receipt.gasUsed);

    let [conditionalTx, executable] = await Promise.all([
      conditional.conditionalTransactions.call(id),
      conditional.isExecutable.call(id),
    ]);

    expect(executable).to.be.false;
    expect(conditionalTx.inputHash).to.eq(inputHash);
    expect(conditionalTx.conditionContract).to.eq(afterTimestampCondition.address);
    expect(conditionalTx.cancelStartTimestamp.eq(new BN(0))).to.be.true;
    expect(conditionalTx.bounty.eq(bounty)).to.be.true;
    expect(conditionalTx.conditionData).to.eq(conditionData);
    expect(conditionalTx.from).to.eq(from);

    await wait(delay);

    executable = await conditional.isExecutable.call(id);
    expect(executable).to.be.true;

    const executer = accounts[2];

    await executeTx(conditional, id, testContract, 'test', executer, arg_1, arg_2);

    const [called, success] = await Promise.all([
      testContract.called.call(),
      testContract.success.call(),
    ]);

    expect(called).to.be.true;
    expect(success).to.be.true;
  });
});
