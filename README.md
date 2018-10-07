# Conditional

Ethereum based protocol to automatically conditionally execute future transactions. Pluggable condition contracts allow future execution of transactions based on any condition.

Conditional transaction senders put up ETH bounties to incentivize executers to execute transactions. Call data is hashed rather than stored entirely on chain to optimize gas usage.

Also included is a basic server that will listen for conditional transactions and execute them (and receive bounties) when they are executable.

## Contracts

### Conditional.sol

```solidity
function addTx(
    address to,
    bytes4 functionSignature,
    bytes data,
    address conditionContract,
    uint256 nonce,
    bytes conditionData
) external payable;
```

to - contract address to call

functionSignature - signature of the function to call on the contract

data - data encoded as bytes to sent to the contract call

conditionContract - address of the condition contract which determines when the transaction can be sent

nonce - nonce unique to the sender which determines the transaction id

conditionData - data to send to the condition contract

payable - all ETH paid will be added as a bounty to execute this transaction when the condition is met

```solidity
function executeTx(
    bytes32 id,
    address to,
    bytes4 functionSignature,
    bytes data
) external;
```

id - id of the transaction to execute

to - address to send the transaction to. Must match the to field of the conditional transaction

functionSignature - function signature to call. Must match the conditional transaction

data - data to send with the call. Must match the conditional transaction

## Server

Node server that will listen on all on-chain conditional transactions and continuously look for opportunities to execute conditional transactions and receive bounties.

### Usage

```
cd server
npm i
npm start
```

