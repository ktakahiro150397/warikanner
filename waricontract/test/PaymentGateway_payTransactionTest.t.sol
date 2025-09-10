// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {PaymentGateway} from "../src/PaymentGateway.sol";
import {OwaCoin} from "../src/OwaCoin.sol";
import {WarikanTransaction} from "../src/Model/TransactionModel.sol";
import {SettleWarikanTransaction} from "../src/event/TransactionEvent.sol";

contract PaymentGateway_payTransactionTest is Test {
    PaymentGateway public paymentGateway;
    OwaCoin public owaCoin;

    function setUp() public {
        owaCoin = new OwaCoin(10000);
        paymentGateway = new PaymentGateway(address(owaCoin));
    }

    function test_payTransaction_ShouldEmit_SettleWarikanTransaction() public {
        // 特定の時間を設定
        uint256 expectedTimeStamp = block.timestamp + 1 hours;
        vm.warp(expectedTimeStamp);

        // 事前にトランザクションを追加
        uint128 id = 990002;
        uint128 warikanId = 980002;
        address from = address(0xabc);
        address to = address(0xdef);
        uint amount = 100;
        string memory memo = "Dinner payment";

        paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

        // transferモック
        vm.mockCall(
            address(owaCoin),
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                from,
                to,
                amount
            ),
            abi.encode(true)
        );

        // イベントテスト
        vm.expectEmit();
        emit SettleWarikanTransaction(id, warikanId, expectedTimeStamp);

        // payTransaction関数を呼び出し
        paymentGateway.payTransaction(id);
    }

    function test_payTransaction_ShouldUpdate_TransactionStatusToPaid() public {
        // 事前にトランザクションを追加
        uint128 id = 990002;
        uint128 warikanId = 980002;
        address from = address(0xabc);
        address to = address(0xdef);
        uint amount = 100;
        string memory memo = "Dinner payment";

        paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

        // transferモック
        vm.mockCall(
            address(owaCoin),
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                from,
                to,
                amount
            ),
            abi.encode(true)
        );

        // payTransaction関数を呼び出し
        paymentGateway.payTransaction(id);

        // トランザクションの状態を検証
        WarikanTransaction memory transaction = paymentGateway.getTransaction(
            id
        );
        assertEq(true, transaction.isPaid);
    }

    function test_payTransaction_ShouldError_WhenTransactionNotFound() public {
        // 存在しないトランザクションIDを使用
        uint128 nonExistentId = 123456;

        // 例外が発生することを期待
        vm.expectRevert(
            abi.encodeWithSelector(
                PaymentGateway.TransactionNotFound.selector,
                nonExistentId
            )
        );

        // payTransaction関数を呼び出し
        paymentGateway.payTransaction(nonExistentId);
    }

    function test_payTransaction_ShouldError_WhenTransactionAlreadyPaid()
        public
    {
        // 事前にトランザクションを追加
        uint128 id = 990002;
        uint128 warikanId = 980002;
        address from = address(0xabc);
        address to = address(0xdef);
        uint amount = 100;
        string memory memo = "Dinner payment";

        paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

        // transferモック
        vm.mockCall(
            address(owaCoin),
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                from,
                to,
                amount
            ),
            abi.encode(true)
        );

        // 最初の支払い
        paymentGateway.payTransaction(id);

        // 2回目の支払いで例外が発生することを期待
        vm.expectRevert(
            abi.encodeWithSelector(
                PaymentGateway.TransactionAlreadyPaid.selector,
                id
            )
        );

        // 再度payTransaction関数を呼び出し
        paymentGateway.payTransaction(id);
    }

    // function test_payTransaction_ShouldError_WhenTransactionAlreadyCanceled()
    //     public
    // {
    //     // 事前にトランザクションを追加
    //     uint128 id = 990002;
    //     uint128 warikanId = 980002;
    //     address from = address(0xabc);
    //     address to = address(0xdef);
    //     uint amount = 100;
    //     string memory memo = "Dinner payment";

    //     paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

    //     // トランザクションをキャンセル
    //     // paymentGateway.cancelTransaction(id);

    //     // キャンセルされたトランザクションに対して例外が発生することを期待
    //     vm.expectRevert(
    //         abi.encodeWithSelector(
    //             PaymentGateway.TransactionAlreadyCanceled.selector,
    //             id
    //         )
    //     );

    //     // payTransaction関数を呼び出し
    //     paymentGateway.payTransaction(id);
    // }
}
