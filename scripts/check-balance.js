import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network');
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('PRIVATE_KEY not found in .env');
        return;
    }
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log(`Wallet Address: ${wallet.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} STT`);
}

main().catch(console.error);
