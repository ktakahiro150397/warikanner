// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
// import {ERC721} from "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

contract OwaCoin is ERC20 {
    constructor(uint256 totalCoin) ERC20("OwaCoin", "OWA") {
        _mint(msg.sender, totalCoin * (10 ** decimals()));
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
