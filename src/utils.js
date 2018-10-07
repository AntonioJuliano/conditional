import web3Utils from 'web3-utils';

export function getInputHash(contract, functionName, ...params) {
  const func = contract.abi.find(f => f.name === functionName);

  if (!func) {
    throw new Error('Function not found');
  }

  return web3Utils.soliditySha3(
    contract.address,
    func.signature,
    { type: 'bytes', value: toBytes(params) },
  );
}

export async function addTx(
  conditional,
  to,
  functionName,
  from,
  conditionContractAddress,
  conditionData,
  nonce,
  bounty,
  ...params
) {
  const id = getConditionalTxId(from, nonce);

  const func = to.abi.find(f => f.name === functionName);

  if (!func) {
    throw new Error('Function not found');
  }

  const response = await conditional.addTx(
    to.address,
    func.signature,
    toBytes(params),
    conditionContractAddress,
    nonce,
    conditionData,
    { from, value: bounty },
  );

  response.id = id;

  return response;
}

export function executeTx(conditional, id, contract, functionName, from, ...params) {
  const func = contract.abi.find(f => f.name === functionName);

  if (!func) {
    throw new Error('Function not found');
  }

  const { signature } = func;

  return conditional.executeTx(
    id,
    contract.address,
    signature,
    toBytes(params),
    { from },
  );
}

export function getConditionalTxId(from, nonce) {
  return web3Utils.soliditySha3(
    from,
    { type: 'uint256', value: nonce },
  );
}

export function toBytes(values) {
  return web3Utils.bytesToHex(
    values.reduce((acc, cur) => acc.concat(toBytes32(cur)), []),
  );
}

function toBytes32(val) {
  return web3Utils.hexToBytes(
    web3Utils.padLeft(web3Utils.toHex(val), 64),
  );
}
