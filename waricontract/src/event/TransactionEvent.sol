// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * 割り勘トランザクション追加イベント
 */
event AddWarikanTransaction(
    uint128 id,
    uint128 indexed warikanId,
    address indexed from,
    address indexed to,
    uint amount,
    uint timestamp,
    string memo
);

/**
 * 割り勘トランザクション決済イベント
 */
event SettleWarikanTransaction(
    uint128 indexed id,
    uint128 indexed warikanId,
    uint timestamp
);

/**
 * 割り勘トランザクションキャンセルイベント
 */
event CancelWarikanTransaction(
    uint128 indexed id,
    uint128 indexed warikanId,
    uint timestamp
);
