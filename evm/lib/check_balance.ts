import {ethers} from "ethers";

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
  "function transfer(address to, uint256 amount) returns (bool)"
];

const address = "0x1744cC77319Cb39179f92Ec35889D288055772CE";
const addressPrivateKey = "0x18b154b2e788c21865d1c71cfaf3d7653dd05719cf7bfe05f471e6b132118b57";

const receiverAddress = "0xcF12bdBFB658906CF456FA400832BA6D446C9Ea8";

const tokenContractAddress = "0x62267a09B22Ec88213cf45E1000E0a488D641f81";

const main = async ()  => {
    const provider = new ethers.JsonRpcProvider("http://localhost:7545");
    
    console.log("Check Balance");
    

    // ETH 残高の取得
    const result = await provider.getBalance(address);
    console.log(`ETH balance = ${ethers.formatEther(result)}`);

    // ERC20 トークン残高の取得
    const tokenContract = new ethers.Contract(tokenContractAddress, erc20Abi, provider) as ethers.Contract & IERC20;
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
    const tokenWithSigner = tokenContract.connect(signer) as ethers.Contract & IERC20;;

    try {
        const sendJpyc = "300.0";
        const amountToSend = ethers.parseUnits(sendJpyc, await tokenContract.decimals());
        const tx = await tokenWithSigner.transfer(receiverAddress, amountToSend);
        console.log("Transaction hash:", tx.hash);

        console.log(`${tx.hash} sent ${sendJpyc} JPYCc to ${receiverAddress}`);
    }
    catch (error) {
        console.log("Error sending tokens:", error);
    }
}

main();