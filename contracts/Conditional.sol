pragma solidity 0.4.24;
pragma experimental "v0.5.0";

import { Condition } from "./Condition.sol";

contract Conditional {
    event TxAdded(
        bytes32 indexed id;
        address indexed from;
        bytes32 inputHash;
        uint256 bounty;
        address conditionContract;
        bytes32 conditionData;
    );

    event TxExecuted(
        bytes32 indexed id;
        address indexed executer;
        uint256 bounty;
    );

    struct ConditionalTx {
        bytes32 inputHash;
        uint256 bounty;
        address conditionContract;
        address from;
        uint32 cancelStartTimestamp;
        bytes32 conditionData;
    }

    uint32 public CANCEL_TIMEOUT;

    mapping (bytes32 => ConditionalTx) public conditionalTransactions;

    constructor(
        uint32 cancelTimeout
    )
        public
    {
        CANCEL_TIMEOUT = cancelTimeout;
    }

    function addTx(
        bytes32 inputHash,
        address conditionContract,
        uint256 nonce,
        bytes32 conditionData
    )
        external
        payable
    {
        require(
            inputHash != bytes32(0),
            "Conditional#addTx: inputHash cannot be 0"
        );

        bytes32 id = keccak256(
            msg.sender,
            nonce
        );

        require(
            conditionalTransactions[id].inputHash == bytes32(0),
            "Conditional#addTx: tx already exists"
        );

        conditionalTransactions[id] = ConditionalTx({
            inputHash: inputHash,
            conditionContract: conditionContract,
            bounty: msg.value,
            from: msg.sender,
            conditionData: conditionData
        });

        emit TxAdded(
            id,
            msg.sender,
            inputHash,
            msg.valuer,
            conditionContract,
            conditionData
        );
    }

    function executeTx(
        bytes32 id,
        address to,
        bytes4 functionSignature,
        bytes[] data
    )
        external
        //TODO nonReentrant?
    {
        require(
            Condition(
                conditionalTransactions[id].conditionContract
            ).isMet(conditionalTransactions[id].conditionData),
            "Conditional#executeTx: Condition not met"
        );
        // TODO hash elements of array
        require(
            keccak256(to, functionSignature, data) == conditionalTransactions[id].inputHash,
            "Conditional#executeTx: Call data is invalid"
        );

        to.call(functionSignature, data);

        uint256 bounty = conditionalTransactions[id].bounty
        msg.sender.transfer(bounty);

        delete conditionalTransactions[id];

        emit TxExecuted(
            id,
            msg.sender,
            bounty
        );
    }

    function increaseBounty(
        bytes32 id
    )
        external
        payable
    {
        require(
            conditionalTransactions[id].inputHash != bytes32(0),
            "Conditional#increaseBounty: tx does not exist"
        );

        // Safe because total supply of ETH fits in uint256
        conditionalTransactions[id].bounty = conditionalTransactions[id].bounty + msg.value;
    }

    function initiateCancelTx(
        bytes32 id
    )
        external
    {
        require(
            conditionalTransactions[id].from == msg.sender,
            "Conditional#initiateCancelTx: Only creator can cancel"
        );

        conditionalTransactions[id].cancelStartTimestamp = uint32(block.timestamp);
    }

    function confirmCancelTx(
        bytes32 id
    )
        external
    {
        require(
            conditionalTransactions[id].from == msg.sender,
            "Conditional#confirmCancelTx: Only creator can cancel"
        );
        uint32 cancelStartTimestamp = conditionalTransactions[id].cancelStartTimestamp;
        require(
            cancelStartTimestamp != 0,
            "Conditional#confirmCancelTx: Cancel has not been initiated"
        );
        require(
            cancelStartTimestamp + CANCEL_TIMEOUT <= block.timestamp,
            "Conditional#confirmCancelTx: Cancel has not been initiated"
        );

        msg.sender.transfer(conditionalTransactions[id].bounty);

        delete conditionalTransactions[id];
    }
}