#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status.

# デプロイ先RPC URL
RPC_URL="http://localhost:8545"

# コントラクトアドレス
CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"

# 残高確認アドレス
CHECK_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
SENDER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# 送付先アドレス
TRANSFER_TO="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

DECIMALS=$(cast call $CONTRACT_ADDRESS "decimals()" --rpc-url $RPC_URL | cast --to-dec)
echo "トークンの小数桁数: $DECIMALS"

TOTAL_SUPPLY=$(cast call $CONTRACT_ADDRESS "totalSupply()" --rpc-url $RPC_URL | cast --to-dec)
echo "トークンの総供給量: $TOTAL_SUPPLY"

echo " OwaCoin balance of $CHECK_ADDRESS is:"
BALANCE=$(cast --to-dec \
    $(\
        cast call \
        $CONTRACT_ADDRESS \
        "balanceOf(address)" \
        $CHECK_ADDRESS \
        --rpc-url $RPC_URL \
    ) \
)
echo " $(cast --to-unit $BALANCE $DECIMALS) OwaCoin"

echo " Transfer 1000 OwaCoin to $TRANSFER_TO from $CHECK_ADDRESS:"
cast send \
    $CONTRACT_ADDRESS \
    "transfer(address,uint256)" \
    $TRANSFER_TO \
    $(cast --to-wei 1000 $DECIMALS) \
    --rpc-url $RPC_URL \
    --private-key $SENDER_PRIVATE_KEY

echo " OwaCoin balance of $TRANSFER_TO is:"
BALANCE=$(cast --to-dec \
    $(\
        cast call \
        $CONTRACT_ADDRESS \
        "balanceOf(address)" \
        $TRANSFER_TO \
        --rpc-url $RPC_URL \
    )\
)
echo " $(cast --to-unit $BALANCE $DECIMALS) OwaCoin"
