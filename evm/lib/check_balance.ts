import { ethers } from "ethers";

interface IERC20 {
  balanceOf(owner: string): Promise<bigint>;
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  transfer(to: string, amount: bigint): Promise<ethers.TransactionResponse>;
}

const erc20Abi = [
  // balanceOf(address)
  "function balanceOf(address owner) view returns (uint256)",
  // decimals()
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const addressPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const receiverAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

const tokenContractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

const main = async () => {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  console.log("Check Balance");

  // ETH 残高の取得
  const result = await provider.getBalance(address);
  console.log(`ETH balance = ${ethers.formatEther(result)}`);

  // ERC20 トークン残高の取得
  const tokenContract = new ethers.Contract(
    tokenContractAddress,
    erc20Abi,
    provider
  ) as ethers.Contract & IERC20;
  try {
    const tokenSymbol = await tokenContract.symbol();
    const balance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();

    const formattedBalance = ethers.formatUnits(balance, decimals);
    console.log(`Token balance (${tokenSymbol}) = ${formattedBalance}`);
  } catch (error) {
    console.log("Error accessing token contract:", error);
  }

  // ERC20 トークンの送付
  const signer = new ethers.Wallet(addressPrivateKey, provider);
  const tokenWithSigner = tokenContract.connect(signer) as ethers.Contract &
    IERC20;

  try {
    const sendJpyc = "300.0";
    const amountToSend = ethers.parseUnits(
      sendJpyc,
      await tokenContract.decimals()
    );
    const tx = await tokenWithSigner.transfer(receiverAddress, amountToSend);
    console.log("Transaction hash:", tx.hash);

    console.log(`${tx.hash} sent ${sendJpyc} JPYCc to ${receiverAddress}`);
  } catch (error) {
    console.log("Error sending tokens:", error);
  }
};

main();
