// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "../lib/forge-std/src/Script.sol";
import {OwaCoin} from "../src/OwaCoin.sol";
import {PaymentGateway} from "../src/PaymentGateway.sol";
import {PaymentTrustedForwarder} from "../src/PaymentTrustedForwarder.sol";
import {console} from "../lib/forge-std/src/console.sol";

contract OwaCoinScript is Script {
    OwaCoin public owaCoin;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // コインデプロイ
        uint256 totalCoin = 10000;
        owaCoin = new OwaCoin(totalCoin);
        address deployedContractAddress = address(owaCoin);

        console.log("OwaCoin deployed successfully!");
        console.log("OwaCoin address:", deployedContractAddress);
        console.log("OwaCoin totalSupply:", owaCoin.totalSupply());

        // Forwarderのデプロイ
        PaymentTrustedForwarder forwarder = new PaymentTrustedForwarder(
            "PaymentForwarder"
        );
        address deployedForwarderAddress = address(forwarder);

        console.log("PaymentTrustedForwarder deployed successfully!");
        console.log(
            "PaymentTrustedForwarder address:",
            deployedForwarderAddress
        );

        // 支払い管理スマートコントラクトデプロイ
        PaymentGateway paymentGateway = new PaymentGateway(
            deployedContractAddress,
            deployedForwarderAddress
        );
        address deployedPaymentGatewayAddress = address(paymentGateway);

        console.log("PaymentGateway deployed successfully!");
        console.log("PaymentGateway address:", deployedPaymentGatewayAddress);

        vm.stopBroadcast();
    }
}
