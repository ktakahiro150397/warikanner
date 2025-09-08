#!/bin/bash


set -e # Exit immediately if a command exits with a non-zero status.
set -x # Print commands and their arguments as they are executed.

if npm install -g pnpm; then
    echo "pnpm installed successfully"
else
    echo "Failed to install pnpm" >&2
    exit 1
fi

echo "Installing Foundry..."
if curl -L https://foundry.paradigm.xyz | bash; then
    echo "Foundry installed successfully"
else
    echo "Failed to install Foundry" >&2
    exit 1
fi

if [ -f ~/.bashrc ]; then
    source /home/node/.bashrc || true
fi
export PATH="$HOME/.foundry/bin:$PATH"
if foundryup; then
    echo "Foundary updated successfully"
else
    echo "Failed to update Foundary" >&2
    exit 1
fi

# Foundryのパスを永続化
echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.bashrc

# # ルートディレクトリの依存関係をインストール
# echo "📋 ルート依存関係をインストール中..."
# if pnpm install; then
#     echo "✅ ルート依存関係インストール完了"
# else
#     echo "❌ ルート依存関係インストール失敗"
#     exit 1
# fi

