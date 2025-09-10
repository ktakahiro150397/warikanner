// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";

contract OwaCoinTest is Test {
    uint256 testNumber;

    function setUp() public {
        testNumber = 42;
    }

    // function test_numberIs42() public view {
    //     assertEq(testNumber, 42);
    // }

    // /// forge-config: default.allow_internal_expect_revert = true
    // function testRevert_Subtract43() public {
    //     vm.expectRevert();
    //     testNumber /= 0;
    // }
}
