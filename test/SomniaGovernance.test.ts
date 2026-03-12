import { expect } from "chai";
import { ethers } from "hardhat";
import { SomniaGovernance } from "../typechain-types";

describe("SomniaGovernance", function () {
    let governance: SomniaGovernance;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const SomniaGovernance = await ethers.getContractFactory("SomniaGovernance");
        governance = await SomniaGovernance.deploy();
    });

    describe("Proposals", function () {
        it("Should create a new proposal", async function () {
            await governance.createProposal("Test Title", "Test Description", ethers.parseEther("10"));
            const proposal = await governance.proposals(1);
            expect(proposal.title).to.equal("Test Title");
            expect(proposal.fundingGoal).to.equal(ethers.parseEther("10"));
        });

        it("Should emit ProposalCreated event", async function () {
            await expect(governance.createProposal("Test Title", "Test Description", ethers.parseEther("10")))
                .to.emit(governance, "ProposalCreated")
                .withArgs(1, owner.address, "Test Title", ethers.parseEther("10"));
        });
    });

    describe("Voting", function () {
        beforeEach(async function () {
            await governance.createProposal("Test Title", "Test Description", ethers.parseEther("10"));
        });

        it("Should allow voting", async function () {
            await governance.connect(addr1).vote(1, true);
            const proposal = await governance.proposals(1);
            expect(proposal.yesVotes).to.equal(1);
            expect(await governance.hasVoted(1, addr1.address)).to.be.true;
        });

        it("Should not allow double voting", async function () {
            await governance.connect(addr1).vote(1, true);
            await expect(governance.connect(addr1).vote(1, true)).to.be.revertedWith("Already voted");
        });

        it("Should increment total votes", async function () {
            await governance.connect(addr1).vote(1, true);
            await governance.connect(addr2).vote(1, false);
            expect(await governance.totalVotes()).to.equal(2);
        });
    });

    describe("Funding", function () {
        beforeEach(async function () {
            await governance.createProposal("Test Title", "Test Description", ethers.parseEther("1"));
        });

        it("Should allow funding", async function () {
            await governance.connect(addr1).fund(1, { value: ethers.parseEther("0.5") });
            const proposal = await governance.proposals(1);
            expect(proposal.currentFunding).to.equal(ethers.parseEther("0.5"));
            expect(await governance.totalFunding()).to.equal(ethers.parseEther("0.5"));
        });

        it("Should change status to Funded when goal is reached", async function () {
            await governance.connect(addr1).fund(1, { value: ethers.parseEther("1") });
            const proposal = await governance.proposals(1);
            expect(proposal.status).to.equal(1); // ProposalStatus.Funded
        });

        it("Should emit Funded event", async function () {
            await expect(governance.connect(addr1).fund(1, { value: ethers.parseEther("0.1") }))
                .to.emit(governance, "Funded")
                .withArgs(1, addr1.address, ethers.parseEther("0.1"), ethers.parseEther("0.1"));
        });
    });
});
