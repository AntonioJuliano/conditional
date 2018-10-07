import Web3 from 'web3';
import BigNumber from 'bignumber.js';

const web3 = new Web3();

const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const ethTransRe = /^0x([A-Fa-f0-9]{64})$/;

export const isUuid = (value) => {
  if (typeof value === 'string' && uuidRe.test(value)) {
    return true;
  }
  throw new Error('Invalid UUID');
};

export const isEthTransaction = (value) => {
  if (typeof value === 'string' && ethTransRe.test(value)) {
    return true;
  }
  throw new Error('Invalid ETH Transaction format');
};

export const isEthAddress = value => web3.isAddress(value);

export const toBigNumber = value => new BigNumber(value);
