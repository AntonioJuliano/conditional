pragma solidity 0.4.24;
pragma experimental "v0.5.0";

contract AfterTimestampCondition is Condition {
    function isMet(bytes32 conditionData)
        external
        view
        returns (bool)
    {
        return block.number >= uint256(conditionData);
    }
}
