// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

struct WarikanTransaction {
    // トランザクション固有のID
    uint128 id;
    // 割り勘処理ID
    uint128 warikanId;
    // 支払元のアドレス
    address from;
    // 支払先のアドレス
    address to;
    // 支払金額
    uint amount;
    // タイムスタンプ
    uint timestamp;
    // 支払いが完了している場合はtrue、未払いの場合はfalse
    bool isPaid;
    // この支払いがキャンセルされている場合はtrue
    bool isCanceled;
}
