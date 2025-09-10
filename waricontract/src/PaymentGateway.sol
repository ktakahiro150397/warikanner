// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// import {WarikanTransaction} from "Model/TransactionModel.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {WarikanTransaction} from "./Model/TransactionModel.sol";
import {AddWarikanTransaction, SettleWarikanTransaction} from "./event/TransactionEvent.sol";

contract PaymentGateway {
    IERC20 public token;

    /**
     * IDとトランザクションのマッピング
     */
    mapping(uint128 => WarikanTransaction) public transactions;

    /**
     * 割り勘IDとトランザクションIDのマッピング
     */
    mapping(uint128 => uint128[]) public warikanTransactions;

    // カスタムエラーの定義
    error TransactionNotFound(uint128 id);
    error TransactionAlreadyPaid(uint128 id);
    error TransactionAlreadyCanceled(uint128 id);
    error TransferFailed(address from, address to, uint256 amount);

    constructor(address tokenAddress) {
        // 取り扱うERC20トークンの参照を設定
        token = IERC20(tokenAddress);
    }

    /**
     * 新しい割り勘トランザクションを追加します。
     */
    function addNewTransaction(
        uint128 id,
        uint128 warikanId,
        address from,
        address to,
        uint amount,
        string calldata memo
    ) public {
        uint currentTimestamp = block.timestamp;

        // 新しいトランザクションを作成
        WarikanTransaction memory newTransaction = WarikanTransaction({
            id: id,
            warikanId: warikanId,
            from: from,
            to: to,
            amount: amount,
            timestamp: currentTimestamp,
            isPaid: false,
            isCanceled: false
        });

        // トランザクションをマッピングに保存
        transactions[id] = newTransaction;
        warikanTransactions[warikanId].push(id);

        emit AddWarikanTransaction(
            id,
            warikanId,
            from,
            to,
            amount,
            currentTimestamp,
            memo
        );
    }

    function payTransaction(uint128 id) public {
        WarikanTransaction memory transaction = transactions[id];

        if (transaction.id == 0) {
            revert TransactionNotFound(id);
        }

        if (transaction.isPaid) {
            revert TransactionAlreadyPaid(id);
        }

        if (transaction.isCanceled) {
            revert TransactionAlreadyCanceled(id);
        }

        // トークンの送金を実行
        address from = transaction.from;
        address to = transaction.to;
        uint amount = transaction.amount;

        token.transferFrom(from, to, amount);

        // トランザクションの状態を更新
        transaction.isPaid = true;
        transactions[id] = transaction;

        // 支払い完了イベント
        emit SettleWarikanTransaction(
            id,
            transaction.warikanId,
            block.timestamp
        );
    }

    /**
     * 指定されたIDのトランザクションを取得
     */
    function getTransaction(
        uint128 id
    ) public view returns (WarikanTransaction memory) {
        return transactions[id];
    }

    /**
     * 指定された割り勘IDに関連するすべてのトランザクションIDを取得
     */
    function getWarikanTransactions(
        uint128 warikanId
    ) public view returns (uint128[] memory) {
        return warikanTransactions[warikanId];
    }
}
