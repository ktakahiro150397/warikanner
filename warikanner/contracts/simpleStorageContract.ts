export const  targetChainId = 0x539; // 1337の16進数表現
export const  targetChainIdStr = "0x539"; // 1337の16進数表現
export const targetNetwork = {
  chainId: targetChainId,
  chainName: "Ganache Local",
  rpcUrls: ["http://127.0.0.1:7545"],
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
};


export const contractAddress = "0xd0707262Bd756043361331d96D34734017E4a281";

export const contractABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "x",
          "type": "uint256"
        }
      ],
      "name": "set",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];

