#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status.
# set -x # Print commands and their arguments as they are executed.

# デプロイ先RPC URL
RPC_URL="http://localhost:8545"

# デプロイ元の秘密鍵
# anvilで発行された秘密鍵を記載
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

echo "Deploying OwaCoin contract..."
echo "RPC URL: $RPC_URL"
echo "Using private key: $PRIVATE_KEY"

forge script ../script/OwaCoin.s.sol:OwaCoinScript \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast

echo "OwaCoin contract deployed successfully."
