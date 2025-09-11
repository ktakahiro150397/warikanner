// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {PaymentGateway} from "../src/PaymentGateway.sol";
import {OwaCoin} from "../src/OwaCoin.sol";
import {WarikanTransaction} from "../src/Model/TransactionModel.sol";
import {CancelWarikanTransaction} from "../src/event/TransactionEvent.sol";

contract PaymentGateway_cancelTransactionTest is Test {
    PaymentGateway public paymentGateway;
    OwaCoin public owaCoin;

    function setUp() public {
        owaCoin = new OwaCoin(10000);
        paymentGateway = new PaymentGateway(address(owaCoin));
    }

    function test_cancelTransaction_ShouldEmit_CancelWarikanTransaction()
        public
    {
        // 特定の時間を設定
        uint256 expectedTimeStamp = block.timestamp + 1 hours;
        vm.warp(expectedTimeStamp);

        // 事前にトランザクションを追加
        uint128 id = 990003;
        uint128 warikanId = 980003;
        address from = address(0xabc);
        address to = address(0xdef);
        uint amount = 100;
        string memory memo = "Lunch payment";

        paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

        // イベントテスト
        vm.expectEmit();
        emit CancelWarikanTransaction(id, warikanId, expectedTimeStamp);

        // cancelTransaction関数を呼び出し
        paymentGateway.cancelTransaction(id);
    }

    function test_cancelTransaction_ShouldUpdate_TransactionStatusToCanceled()
        public
    {
        // 事前にトランザクションを追加
        uint128 id = 990003;
        uint128 warikanId = 980003;
        address from = address(0xabc);
        address to = address(0xdef);
        uint amount = 100;
        string memory memo = "Lunch payment";

        paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

        // cancelTransaction関数を呼び出し
        paymentGateway.cancelTransaction(id);

        // トランザクションの状態を取得
        WarikanTransaction memory transaction = paymentGateway.getTransaction(
            id
        );

        // isCanceledがtrueに更新されていることを確認
        assertTrue(transaction.isCanceled);
    }

    function test_cancelTransaction_ShouldRevert_IfTransactionNotFound()
        public
    {
        uint128 nonExistentId = 999999;

        // 存在しないトランザクションIDでcancelTransactionを呼び出し、リバートを期待
        vm.expectRevert(
            abi.encodeWithSignature(
                "TransactionNotFound(uint128)",
                nonExistentId
            )
        );
        paymentGateway.cancelTransaction(nonExistentId);
    }

    function test_cancelTransaction_ShouldRevert_IfTransactionAlreadyPaid()
        public
    {
        // 事前にトランザクションを追加
        uint128 id = 990004;
        uint128 warikanId = 980004;
        address from = address(0xabc);
        address to = address(0xdef);
        uint amount = 100;
        string memory memo = "Breakfast payment";

        paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

        // トランザクションを支払い済みに更新
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
        paymentGateway.payTransaction(id);

        // 支払い済みのトランザクションIDでcancelTransactionを呼び出し、リバートを期待
        vm.expectRevert(
            abi.encodeWithSignature("TransactionAlreadyPaid(uint128)", id)
        );
        paymentGateway.cancelTransaction(id);
    }

    function test_cancelTransaction_ShouldRevert_IfTransactionAlreadyCanceled()
        public
    {
        // 事前にトランザクションを追加
        uint128 id = 990005;
        uint128 warikanId = 980005;
        address from = address(0xabc);
        address to = address(0xdef);
        uint amount = 100;
        string memory memo = "Snack payment";

        paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

        // トランザクションをキャンセル済みに更新
        paymentGateway.cancelTransaction(id);

        // キャンセル済みのトランザクションIDで再度cancelTransactionを呼び出し、リバートを期待
        vm.expectRevert(
            abi.encodeWithSignature("TransactionAlreadyCanceled(uint128)", id)
        );
        paymentGateway.cancelTransaction(id);
    }
}
