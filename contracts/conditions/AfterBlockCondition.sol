pragma solidity 0.4.25;
pragma experimental "v0.5.0";

import { Condition } from "../Condition.sol";

contract AfterBlockCondition is Condition {
    function isMet(bytes conditionData)
        external
        view
        returns (bool)
    {
        return block.number >= parseBlockNumber(conditionData);
    }

    function parseBlockNumber(
        bytes conditionData
    )
        private
        pure
        returns (uint256)
    {
        uint256 blockNumber;

        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            blockNumber := mload(add(conditionData, 32))
        }

        return blockNumber;
    }
}
