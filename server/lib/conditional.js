import Web3 from 'web3';
import Conditional from '../artifacts/Conditional.json';

const web3 = new Web3('https://kovan.infura.io/v3/828475865dfe4c31a9c8d6321250f7e0');

const conditional = new web3.eth.Contract(Conditional.abi, conditional.networks[42].address);

export default conditional;
