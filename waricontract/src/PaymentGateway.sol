// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// import {WarikanTransaction} from "Model/TransactionModel.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {WarikanTransaction} from "./Model/TransactionModel.sol";
import {AddWarikanTransaction} from "./event/TransactionEvent.sol";

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
