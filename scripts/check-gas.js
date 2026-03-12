import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';
import dotenv from 'dotenv';
dotenv.config();

const somniaTestnet = defineChain({
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://api.infra.testnet.somnia.network'],
            webSocket: ['wss://api.infra.testnet.somnia.network']
        }
    }
});

async function main() {
    const publicClient = createPublicClient({
        chain: somniaTestnet,
        transport: http()
    });

    const block = await publicClient.getBlock();
    console.log('Block:', block.number);
    console.log('Base fee per gas:', block.baseFeePerGas);

    const gasPrice = await publicClient.getGasPrice();
    console.log('Current gas price:', gasPrice);
}

main();
