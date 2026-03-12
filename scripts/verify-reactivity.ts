import { createPublicClient, http, decodeEventLog } from 'viem';
import { SDK } from '@somnia-chain/reactivity';
import { defineChain } from 'viem';
import { SOMNIA_GOVERNANCE_ABI, SOMNIA_GOVERNANCE_ADDRESS } from '../src/contracts/daoAbi.ts';

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
    console.log("🚀 Initializing Somnia Reactivity Verification...");

    const publicClient = createPublicClient({
        chain: somniaTestnet,
        transport: http()
    });

    const sdk = new SDK({
        public: publicClient as any
    });

    console.log(`📡 Subscribing to: ${SOMNIA_GOVERNANCE_ADDRESS}`);
    console.log("⏳ Waiting for governance events (Vote, Fund, ProposalCreated)...");

    try {
        const subscription = await sdk.subscribe({
            ethCalls: [],
            eventContractSources: [SOMNIA_GOVERNANCE_ADDRESS as `0x${string}`],
            onData: (data: any) => {
                const res = data.result || data;
                if (!res.data || !res.topics) return;

                try {
                    const decoded = decodeEventLog({
                        abi: SOMNIA_GOVERNANCE_ABI,
                        data: res.data,
                        topics: res.topics,
                    });

                    console.log("\n✨ REAL-TIME EVENT DETECTED!");
                    console.log(`🔹 Event: ${decoded.eventName}`);
                    console.log(`🔹 TX: ${res.transactionHash}`);
                    console.log(`🔹 Args:`, JSON.stringify(decoded.args, (k, v) =>
                        typeof v === 'bigint' ? v.toString() : v, 2));
                } catch (e) {
                    // console.log("Unrelated event detected.");
                }
            },
            onError: (err) => {
                console.error("❌ Subscription Error:", err);
            }
        });

        console.log("✅ Subscription active. Press Ctrl+C to exit.");

        // Keep process alive
        process.stdin.resume();

        process.on('SIGINT', () => {
            console.log("\n🔌 Cleaning up subscription...");
            subscription.unsubscribe();
            process.exit();
        });

    } catch (err) {
        console.error("❌ Failed to setup subscription:", err);
        process.exit(1);
    }
}

main();
