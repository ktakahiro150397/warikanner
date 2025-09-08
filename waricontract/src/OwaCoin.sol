// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract OwaCoin is ERC20 {
    constructor() ERC20("OwaCoin", "OWA") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }
}