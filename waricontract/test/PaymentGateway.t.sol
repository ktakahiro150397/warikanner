// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {PaymentGateway} from "../src/PaymentGateway.sol";
import {WarikanTransaction} from "../src/Model/TransactionModel.sol";
import {AddWarikanTransaction} from "../src/event/TransactionEvent.sol";

contract PaymentGatewayTest is Test {
    PaymentGateway public paymentGateway;

    function setUp() public {
        // テスト用にOwaCoinのアドレスをダミーで設定
        address dummyOwaCoinAddress = address(0x123);
        paymentGateway = new PaymentGateway(dummyOwaCoinAddress);
    }

    function test_addNewTransaction() public {
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

        // イベントの発生を確認
    }
}
