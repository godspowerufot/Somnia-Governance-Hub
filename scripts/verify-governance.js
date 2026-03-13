import { createPublicClient, http } from 'viem';

const SOMNIA_GOVERNANCE_ADDRESS = '0xd45b60a393defaca9be87329d4a927357eb846bf';
const SOMNIA_GOVERNANCE_ABI = [
    {
        "inputs": [],
        "name": "totalProposals",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getGlobalStats",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

async function verify() {
    console.log("🔍 Verifying Somnia Governance Contract...");
    console.log(`📍 Address: ${SOMNIA_GOVERNANCE_ADDRESS}`);

    const client = createPublicClient({
        transport: http('https://api.infra.testnet.somnia.network'),
    });

    try {
        const totalProposals = await client.readContract({
            address: SOMNIA_GOVERNANCE_ADDRESS,
            abi: SOMNIA_GOVERNANCE_ABI,
            functionName: 'totalProposals',
        });

        console.log(`✅ Connection Successful!`);
        console.log(`📊 Total Proposals: ${totalProposals}`);

        const stats = await client.readContract({
            address: SOMNIA_GOVERNANCE_ADDRESS,
            abi: SOMNIA_GOVERNANCE_ABI,
            functionName: 'getGlobalStats',
        });

        console.log(`📈 Global Stats:`);
        console.log(`   - Active Proposals: ${stats[0]}`);
        console.log(`   - Total Funding: ${stats[1]} wei`);
        console.log(`   - Total Votes: ${stats[2]}`);

    } catch (error) {
        console.error("❌ Verification Failed:");
        console.error(error.message || error);
        process.exit(1);
    }
}

verify();
