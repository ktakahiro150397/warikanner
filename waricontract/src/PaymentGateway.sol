// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// import {WarikanTransaction} from "Model/TransactionModel.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract PaymentGateway {
    IERC20 public token;

    constructor(address tokenAddress) {
        // 取り扱うERC20トークンの参照を設定
        token = IERC20(tokenAddress);
    }
}
