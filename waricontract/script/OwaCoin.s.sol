// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {OwaCoin} from "../src/OwaCoin.sol";

contract OwaCoinScript is Script {
    OwaCoin public owaCoin;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        owaCoin = new OwaCoin();

        vm.stopBroadcast();
    }
}