// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SomniaGovernance
 * @dev A governance and funding DAO contract optimized for the Somnia blockchain.
 * Implements proposal creation, voting, and funding with Reactivity events.
 */
contract SomniaGovernance {
    enum ProposalStatus {
        Active,
        Funded,
        Executed,
        Defeated
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 fundingGoal;
        uint256 currentFunding;
        uint256 yesVotes;
        uint256 noVotes;
        ProposalStatus status;
        uint256 createdAt;
    }

    // Global Statistics (Optimized for Somnia Gas Model - reuse warm slots)
    uint256 public totalProposals;
    uint256 public totalFunding;
    uint256 public totalVotes;

    // proposalId => Proposal
    mapping(uint256 => Proposal) public proposals;
    // proposalId => user => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Events for Somnia Reactivity
    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        string title,
        uint256 fundingGoal
    );
    event Voted(
        uint256 indexed id,
        address indexed voter,
        bool support,
        uint256 totalYes,
        uint256 totalNo
    );
    event Funded(
        uint256 indexed id,
        address indexed funder,
        uint256 amount,
        uint256 currentFunding
    );
    event StatusChanged(uint256 indexed id, ProposalStatus newStatus);

    /**
     * @dev Create a new governance proposal.
     */
    function createProposal(
        string calldata _title,
        string calldata _description,
        uint256 _fundingGoal
    ) external returns (uint256) {
        require(_fundingGoal > 0, "Goal must be > 0");

        uint256 proposalId = ++totalProposals;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: _title,
            description: _description,
            fundingGoal: _fundingGoal,
            currentFunding: 0,
            yesVotes: 0,
            noVotes: 0,
            status: ProposalStatus.Active,
            createdAt: block.timestamp
        });

        emit ProposalCreated(proposalId, msg.sender, _title, _fundingGoal);
        return proposalId;
    }

    /**
     * @dev Vote on an active proposal.
     */
    function vote(uint256 _proposalId, bool _support) external {
        Proposal storage proposal = proposals[_proposalId];
        require(
            proposal.status == ProposalStatus.Active,
            "Proposal not active"
        );
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        if (_support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }

        hasVoted[_proposalId][msg.sender] = true;
        totalVotes++;

        emit Voted(
            _proposalId,
            msg.sender,
            _support,
            proposal.yesVotes,
            proposal.noVotes
        );
    }

    /**
     * @dev Fund a proposal with SOMNIA tokens.
     */
    function fund(uint256 _proposalId) external payable {
        Proposal storage proposal = proposals[_proposalId];
        require(
            proposal.status == ProposalStatus.Active,
            "Proposal not active"
        );
        require(msg.value > 0, "Must send SOMNIA");

        proposal.currentFunding += msg.value;
        totalFunding += msg.value;

        emit Funded(
            _proposalId,
            msg.sender,
            msg.value,
            proposal.currentFunding
        );

        if (proposal.currentFunding >= proposal.fundingGoal) {
            proposal.status = ProposalStatus.Funded;
            emit StatusChanged(_proposalId, ProposalStatus.Funded);
        }
    }

    /**
     * @dev Get total statistics in a single call (Optimized for frontend consumption).
     */
    function getGlobalStats()
        external
        view
        returns (uint256, uint256, uint256)
    {
        return (totalProposals, totalFunding, totalVotes);
    }
}
