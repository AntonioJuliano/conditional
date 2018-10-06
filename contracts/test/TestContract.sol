pragma solidity 0.4.25;
pragma experimental "v0.5.0";

contract TestContract {
    bool public success;
    bool public called;

    uint256 public ARG_1 = 12345;
    uint8 public ARG_2 = 7;

    function test(uint256 arg1, uint8 arg2) external {
        called = true;

        if (arg1 == ARG_1 && arg2 == ARG_2) {
            success = true;
        }
    }
}
