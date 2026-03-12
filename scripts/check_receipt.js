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

async function checkTx() {
    const client = createPublicClient({
        chain: somniaTestnet,
        transport: http(),
    });

    const hash = '0xb3187a830fb1a27a544cd5ff58aedb7e020d45352f50d0dd7f1e43efea16e6b4';
    console.log(`Checking transaction: ${hash}`);

    try {
        const receipt = await client.getTransactionReceipt({ hash });
        console.log('Status:', receipt.status);
        console.log('Contract Address:', receipt.contractAddress);
        console.log('Gas Used:', receipt.gasUsed.toString());
        console.log('Effective Gas Price:', receipt.effectiveGasPrice.toString());

        if (receipt.status === 'reverted') {
            console.log('FAILURE: Transaction reverted!');
        } else {
            console.log('SUCCESS: Transaction succeeded!');
            if (receipt.contractAddress) {
                const code = await client.getBytecode({ address: receipt.contractAddress });
                console.log('Bytecode at address:', code ? code.slice(0, 100) + '...' : 'null');
            }
        }
    } catch (err) {
        console.log('ERROR:', err.message);
    }
}

checkTx();
