pragma solidity 0.4.25;
pragma experimental "v0.5.0";

interface Condition {
    function isMet(bytes conditionData)
        external
        view
        returns (bool);
}
