import { createPublicClient, http } from 'viem';
import { ContractService } from '../src/services/contractService';
import { defineChain } from 'viem';

const somniaTestnet = defineChain({
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://api.infra.testnet.somnia.network'],
        }
    }
});

async function test() {
    const publicClient = createPublicClient({
        chain: somniaTestnet,
        transport: http()
    });

    const service = new ContractService(publicClient as any);
    console.log("Fetching logs from the last 500 blocks...");
    try {
        const events = await service.getAllContractLogs();
        console.log(`Found ${events.length} events.`);
        if (events.length > 0) {
            console.log("Latest event sample:");
            console.log(JSON.stringify(events[0], (key, value) =>
                typeof value === 'bigint' ? value.toString() : value, 2
            ));
        }
    } catch (err) {
        console.error("Error fetching logs:", err);
    }
}

test();
