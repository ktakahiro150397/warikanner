// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

struct WarikanTransaction {
    // TransactionID
    uint id;
    // 支払元のアドレス
    address from;
    // 支払先のアドレス
    address to;
    // 支払金額
    uint amount;
    // このトランザクションのメモ
    string memo;
    // タイムスタンプ
    uint timestamp;
    // 支払いが完了している場合はtrue、未払いの場合はfalse
    bool isPaid;
}
