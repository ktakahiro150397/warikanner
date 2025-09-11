// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {PaymentGateway} from "../src/PaymentGateway.sol";
import {WarikanTransaction} from "../src/Model/TransactionModel.sol";
import {AddWarikanTransaction} from "../src/event/TransactionEvent.sol";

contract PaymentGateway_addnewTransactionTest is Test {
    PaymentGateway public paymentGateway;

    function setUp() public {
        // テスト用にOwaCoinのアドレスをダミーで設定
        address dummyOwaCoinAddress = address(0x123);
        paymentGateway = new PaymentGateway(dummyOwaCoinAddress, address(0x1));
    }

    function test_addNewTransaction_ShouldEmit_AddWarikanTransaction() public {
        uint128 id = 990001;
        uint128 warikanId = 980001;
        address from = address(0xabc);
        address to = address(0xdef);
        uint amount = 100;
        string memory memo = "Lunch payment";
        uint initialTimestamp = block.timestamp;

        // イベントテスト
        // https://getfoundry.sh/reference/cheatcodes/expect-emit/
        // イベント呼び出しを期待
        vm.expectEmit();
        // 期待するイベントをemit
        emit AddWarikanTransaction(
            id,
            warikanId,
            from,
            to,
            amount,
            block.timestamp,
            memo
        );

        // イベントを発生する関数を呼び出し
        paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

        // トランザクションが正しく保存されていることを確認
        WarikanTransaction memory transaction = paymentGateway.getTransaction(
            id
        );

        assertEq(transaction.id, id);
        assertEq(transaction.warikanId, warikanId);
        assertEq(transaction.from, from);
        assertEq(transaction.to, to);
        assertEq(transaction.amount, amount);
        assertGe(transaction.timestamp, initialTimestamp);
        assertEq(transaction.isPaid, false);
        assertEq(transaction.isCanceled, false);

        // warikanTransactionsマッピングも確認
        uint128[] memory txIds = paymentGateway.getWarikanTransactions(
            warikanId
        );
        assertEq(txIds.length, 1);
        assertEq(txIds[0], id);
    }

    function test_addNewTransaction_ShouldSaveTransaction() public {
        uint128 id = 990001;
        uint128 warikanId = 980001;
        address from = address(0xabc);
        address to = address(0xdef);
        uint amount = 100;
        string memory memo = "Lunch payment";
        uint initialTimestamp = block.timestamp;

        // イベントを発生する関数を呼び出し
        paymentGateway.addNewTransaction(id, warikanId, from, to, amount, memo);

        // トランザクションが正しく保存されていることを確認
        WarikanTransaction memory transaction = paymentGateway.getTransaction(
            id
        );

        assertEq(transaction.id, id);
        assertEq(transaction.warikanId, warikanId);
        assertEq(transaction.from, from);
        assertEq(transaction.to, to);
        assertEq(transaction.amount, amount);
        assertGe(transaction.timestamp, initialTimestamp);
        assertEq(transaction.isPaid, false);
        assertEq(transaction.isCanceled, false);

        // warikanTransactionsマッピングも確認
        uint128[] memory txIds = paymentGateway.getWarikanTransactions(
            warikanId
        );
        assertEq(txIds.length, 1);
        assertEq(txIds[0], id);
    }

    function test_addNewTransaction_ShouldSaveByWarikanId() public {
        uint128 warikanId = 980001;

        // 複数のトランザクションを追加
        paymentGateway.addNewTransaction(
            990001,
            warikanId,
            address(0xabc),
            address(0xdef),
            100,
            "Lunch payment"
        );
        paymentGateway.addNewTransaction(
            990002,
            warikanId,
            address(0x123),
            address(0x456),
            200,
            "Dinner payment"
        );

        // warikanTransactionsマッピングを確認
        uint128[] memory txIds = paymentGateway.getWarikanTransactions(
            warikanId
        );
        assertEq(txIds.length, 2);
        assertEq(txIds[0], 990001);
        assertEq(txIds[1], 990002);
    }
}
