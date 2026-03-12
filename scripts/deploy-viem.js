import { createWalletClient, createPublicClient, http, parseEther, parseGwei } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import fs from 'fs';
import path from 'path';
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
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error("No private key");
    // Remove TS syntax
    const account = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`);

    const client = createWalletClient({
        account,
        chain: somniaTestnet,
        transport: http()
    });

    const publicClient = createPublicClient({
        chain: somniaTestnet,
        transport: http()
    });

    const artifactPath = path.resolve('./artifacts/src/contracts/SomniaGovernance.sol/SomniaGovernance.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    console.log('Deploying SomniaGovernance via Viem (JS)...');

    try {
        const hash = await client.deployContract({
            abi: artifact.abi,
            bytecode: artifact.bytecode,
            args: [],
            maxPriorityFeePerGas: parseGwei('2'),
            maxFeePerGas: parseGwei('12'),
            gas: 30000000n
        });

        console.log('Transaction hash:', hash);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Contract deployed at:', receipt.contractAddress);

        const addressesPath = path.resolve('./src/contracts/addresses.json');
        const addresses = {
            SomniaGovernance: receipt.contractAddress,
            network: "Somnia Testnet",
            chainId: 50312
        };
        fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
        console.log('Addresses saved to:', addressesPath);
    } catch (err) {
        console.error('Deployment failed:', err);
    }
}

main();
