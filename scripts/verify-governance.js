import { ethers } from "ethers";
import fs from "fs";

async function main() {
    console.log("Starting SomniaGovernance standalone test...");

    // Use local hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Hardhat's default first account
    const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const addr1 = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
    const addr2 = new ethers.Wallet("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", provider);

    console.log("Owner address:", signer.address);

    // Load Artifact
    const artifactPath = "./artifacts/src/contracts/SomniaGovernance.sol/SomniaGovernance.json";
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const governance = await factory.deploy();
    await governance.waitForDeployment();
    const address = await governance.getAddress();
    console.log("Governance deployed to:", address);

    const contract = new ethers.Contract(address, artifact.abi, provider);

    // Test Proposal Creation
    console.log("\nTesting: Proposal Creation");
    const createTx = await governance.createProposal(
        "Test Proposal",
        "Description",
        ethers.parseEther("10")
    );
    await createTx.wait();

    const proposal = await contract.proposals(1);
    console.log("Proposal 1 Title:", proposal.title);
    if (proposal.title !== "Test Proposal") throw new Error("Title mismatch");

    // Test Voting
    console.log("\nTesting: Voting");
    const voteTx = await governance.connect(addr1).vote(1, true);
    await voteTx.wait();

    const updatedProposal = await contract.proposals(1);
    console.log("Proposal 1 Yes Votes:", updatedProposal.yesVotes.toString());
    if (updatedProposal.yesVotes !== 1n) throw new Error("Vote count mismatch");

    // Test Funding
    console.log("\nTesting: Funding");
    const fundTx = await governance.connect(addr2).fund(1, {
        value: ethers.parseEther("5")
    });
    await fundTx.wait();

    const fundedProposal = await contract.proposals(1);
    console.log("Proposal 1 Current Funding:", ethers.formatEther(fundedProposal.currentFunding));
    if (fundedProposal.currentFunding !== ethers.parseEther("5")) throw new Error("Funding amount mismatch");

    // Reaching goal
    console.log("\nTesting: Reaching Goal");
    const fundTx2 = await governance.connect(addr1).fund(1, {
        value: ethers.parseEther("5")
    });
    await fundTx2.wait();

    const finalProposal = await contract.proposals(1);
    console.log("Proposal 1 Status:", finalProposal.status.toString()); // Should be 1 (Funded)
    if (finalProposal.status !== 1n) throw new Error("Status mismatch (expected Funded)");

    console.log("\nAll contract tests passed successfully!");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
