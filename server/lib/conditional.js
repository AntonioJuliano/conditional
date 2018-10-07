import Web3 from 'web3';
import Conditional from '../artifacts/Conditional.json';
import { ETH_NODE_URL } from '../helpers/constants';

const web3 = new Web3(Web3.providers.WebsocketProvider(ETH_NODE_URL));

const conditional = new web3.eth.Contract(Conditional.abi, Conditional.networks['42'].address);

export default conditional;
