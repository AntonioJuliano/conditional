pragma solidity 0.4.25;
pragma experimental "v0.5.0";

import { Condition } from "../Condition.sol";

contract AfterTimestampCondition is Condition {
    function isMet(bytes32 conditionData)
        external
        view
        returns (bool)
    {
        return block.number >= uint256(conditionData);
    }
}
