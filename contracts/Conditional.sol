pragma solidity 0.4.25;
pragma experimental "v0.5.0";

import { Condition } from "./Condition.sol";

contract Conditional {
    event TxAdded(
        bytes32 indexed id,
        address indexed from,
        uint256 bounty,
        address conditionContract,
        bytes conditionData,
        address to,
        bytes4 functionSignature,
        bytes data
    );

    event TxExecuted(
        bytes32 indexed id,
        address indexed executer,
        uint256 bounty,
        bool success
    );

    struct ConditionalTx {
        bytes32 inputHash;
        uint256 bounty;
        address conditionContract;
        address from;
        uint32 cancelStartTimestamp;
        bytes conditionData;
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
        address to,
        bytes4 functionSignature,
        bytes data,
        address conditionContract,
        uint256 nonce,
        bytes conditionData
    )
        external
        payable
    {
        bytes32 id = addConditionalTx(
            to,
            functionSignature,
            data,
            conditionContract,
            nonce,
            conditionData
        );

        emit TxAdded(
            id,
            msg.sender,
            msg.value,
            conditionContract,
            conditionData,
            to,
            functionSignature,
            data
        );
    }

    function executeTx(
        bytes32 id,
        address to,
        bytes4 functionSignature,
        bytes data
    )
        external
    {
        require(
            Condition(
                conditionalTransactions[id].conditionContract
            ).isMet(conditionalTransactions[id].conditionData),
            "Conditional#executeTx: Condition not met"
        );
        require(
            getInputHash(
                to,
                functionSignature,
                data
            ) == conditionalTransactions[id].inputHash,
            "Conditional#executeTx: Call data is invalid"
        );
        uint256 bounty = conditionalTransactions[id].bounty;
        delete conditionalTransactions[id];

        bool success = to.call(functionSignature, data);

        msg.sender.transfer(bounty);

        emit TxExecuted(
            id,
            msg.sender,
            bounty,
            success
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

    function isExecutable(
        bytes32 id
    )
        external
        view
        returns (bool)
    {
        return Condition(
            conditionalTransactions[id].conditionContract
        ).isMet(conditionalTransactions[id].conditionData);
    }

    function getInputHash(
        address to,
        bytes4 functionSignature,
        bytes data
    )
        private
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                to,
                functionSignature,
                data
            )
        );
    }

    function addConditionalTx(
        address to,
        bytes4 functionSignature,
        bytes data,
        address conditionContract,
        uint256 nonce,
        bytes conditionData
    )
        private
        returns (bytes32)
    {
        bytes32 id = keccak256(
            abi.encodePacked(
                msg.sender,
                nonce
            )
        );

        require(
            conditionalTransactions[id].inputHash == bytes32(0),
            "Conditional#addTx: tx already exists"
        );

        bytes32 inputHash = getInputHash(
            to,
            functionSignature,
            data
        );

        conditionalTransactions[id] = ConditionalTx({
            inputHash: inputHash,
            conditionContract: conditionContract,
            bounty: msg.value,
            from: msg.sender,
            conditionData: conditionData,
            cancelStartTimestamp: 0
        });

        return id;
    }
}
