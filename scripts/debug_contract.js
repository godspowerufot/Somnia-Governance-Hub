import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';

const somniaTestnet = defineChain({
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://api.infra.testnet.somnia.network'],
        }
    },
});

async function check() {
    const client = createPublicClient({
        chain: somniaTestnet,
        transport: http(),
    });

    const address = '0xd7f8d5eba5a9c140b52765be7747c0070a8b5114';
    console.log(`Checking address: ${address}`);

    try {
        const code = await client.getBytecode({ address });
        if (code && code !== '0x') {
            console.log('SUCCESS: Contract code found!');
            console.log(`Bytecode length: ${code.length}`);
        } else {
            console.log('FAILURE: No code found at this address (might be an EOA or not deployed)');
        }

        const stats = await client.readContract({
            address,
            abi: [{
                "inputs": [],
                "name": "getGlobalStats",
                "outputs": [
                    { "internalType": "uint256", "name": "", "type": "uint256" },
                    { "internalType": "uint256", "name": "", "type": "uint256" },
                    { "internalType": "uint256", "name": "", "type": "uint256" }
                ],
                "stateMutability": "view",
                "type": "function"
            }],
            functionName: 'getGlobalStats',
        });
        console.log(`Global Stats: ${stats}`);
    } catch (err) {
        console.log('ERROR:', err.message);
    }
}

check();
