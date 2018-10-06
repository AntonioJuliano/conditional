pragma solidity 0.4.25;
pragma experimental "v0.5.0";

import { Condition } from "../Condition.sol";

contract AfterTimestampCondition is Condition {
    function isMet(bytes conditionData)
        external
        view
        returns (bool)
    {
        return block.timestamp >= parseTimestamp(conditionData);
    }

    function parseTimestamp(
        bytes conditionData
    )
        private
        pure
        returns (uint256)
    {
        uint256 ts;

        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            ts := mload(add(conditionData, 32))
        }

        return ts;
    }
}
