import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("Starting SomniaGovernance test...");

    const [owner, addr1, addr2] = await ethers.getSigners();
    console.log("Owner address:", owner.address);

    const SomniaGovernance = await ethers.getContractFactory("SomniaGovernance");
    const governance = await SomniaGovernance.deploy();
    await governance.waitForDeployment();
    const address = await governance.getAddress();
    console.log("Governance deployed to:", address);

    // Test Proposal Creation
    console.log("\nTesting: Proposal Creation");
    const createTx = await governance.createProposal(
        "Test Proposal",
        "Description",
        ethers.parseEther("10")
    );
    await createTx.wait();

    const proposal = await governance.proposals(1);
    console.log("Proposal 1 Title:", proposal.title);
    if (proposal.title !== "Test Proposal") throw new Error("Title mismatch");

    // Test Voting
    console.log("\nTesting: Voting");
    const voteTx = await governance.connect(addr1).vote(1, true);
    await voteTx.wait();

    const updatedProposal = await governance.proposals(1);
    console.log("Proposal 1 Yes Votes:", updatedProposal.yesVotes.toString());
    if (updatedProposal.yesVotes !== 1n) throw new Error("Vote count mismatch");

    // Test Funding
    console.log("\nTesting: Funding");
    const fundTx = await governance.connect(addr2).fund(1, {
        value: ethers.parseEther("5")
    });
    await fundTx.wait();

    const fundedProposal = await governance.proposals(1);
    console.log("Proposal 1 Current Funding:", ethers.formatEther(fundedProposal.currentFunding));
    if (fundedProposal.currentFunding !== ethers.parseEther("5")) throw new Error("Funding amount mismatch");

    // Reaching goal
    console.log("\nTesting: Reaching Goal");
    const fundTx2 = await governance.connect(addr1).fund(1, {
        value: ethers.parseEther("5")
    });
    await fundTx2.wait();

    const finalProposal = await governance.proposals(1);
    console.log("Proposal 1 Status:", finalProposal.status.toString()); // Should be 1 (Funded)
    if (finalProposal.status !== 1n) throw new Error("Status mismatch (expected Funded)");

    console.log("\nAll contract tests passed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
