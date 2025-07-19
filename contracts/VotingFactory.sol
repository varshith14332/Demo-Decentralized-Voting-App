// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VotingFactory
 * @dev Decentralized voting system with multiple election support
 * @author VoteChain Team
 */
contract VotingFactory is ReentrancyGuard, Ownable {
    // Enums
    enum ElectionStatus { Pending, Active, Completed, Cancelled }
    enum VoterEligibility { Public, Token, Whitelist }

    // Structs
    struct Election {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 startTime;
        uint256 endTime;
        ElectionStatus status;
        VoterEligibility eligibility;
        uint256 minTokensRequired;
        address tokenAddress;
        uint256 totalVotes;
        string[] options;
        mapping(uint256 => uint256) optionVotes; // optionIndex => voteCount
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voterChoice;
        mapping(address => bool) whitelist;
        bool exists;
    }

    // State variables
    mapping(uint256 => Election) public elections;
    mapping(address => uint256[]) public userElections; // creator => electionIds
    uint256 public electionCounter;
    uint256 public constant MIN_ELECTION_DURATION = 1 hours;
    uint256 public constant MAX_ELECTION_DURATION = 365 days;

    // Events
    event ElectionCreated(
        uint256 indexed electionId,
        address indexed creator,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        uint256 optionIndex,
        uint256 timestamp
    );

    event ElectionStatusChanged(
        uint256 indexed electionId,
        ElectionStatus oldStatus,
        ElectionStatus newStatus
    );

    event VoterWhitelisted(
        uint256 indexed electionId,
        address indexed voter
    );

    // Modifiers
    modifier electionExists(uint256 _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        _;
    }

    modifier onlyElectionCreator(uint256 _electionId) {
        require(
            elections[_electionId].creator == msg.sender,
            "Only election creator can perform this action"
        );
        _;
    }

    modifier canVote(uint256 _electionId) {
        Election storage election = elections[_electionId];
        
        require(election.status == ElectionStatus.Active, "Election is not active");
        require(block.timestamp >= election.startTime, "Election has not started");
        require(block.timestamp <= election.endTime, "Election has ended");
        require(!election.hasVoted[msg.sender], "Already voted");
        
        // Check eligibility
        if (election.eligibility == VoterEligibility.Token) {
            require(election.tokenAddress != address(0), "Token address not set");
            require(
                IERC20(election.tokenAddress).balanceOf(msg.sender) >= election.minTokensRequired,
                "Insufficient token balance"
            );
        } else if (election.eligibility == VoterEligibility.Whitelist) {
            require(election.whitelist[msg.sender], "Not whitelisted");
        }
        _;
    }

    constructor() {}

    /**
     * @dev Create a new election
     * @param _title Election title
     * @param _description Election description  
     * @param _options Array of voting options
     * @param _durationInSeconds Election duration in seconds
     * @param _eligibility Voter eligibility type
     * @param _minTokensRequired Minimum tokens required (for token-based elections)
     * @param _tokenAddress Token contract address (for token-based elections)
     */
    function createElection(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _durationInSeconds,
        VoterEligibility _eligibility,
        uint256 _minTokensRequired,
        address _tokenAddress
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_options.length >= 2, "At least 2 options required");
        require(_options.length <= 10, "Maximum 10 options allowed");
        require(
            _durationInSeconds >= MIN_ELECTION_DURATION && 
            _durationInSeconds <= MAX_ELECTION_DURATION,
            "Invalid duration"
        );

        // Validate token-based elections
        if (_eligibility == VoterEligibility.Token) {
            require(_tokenAddress != address(0), "Token address required");
            require(_minTokensRequired > 0, "Minimum tokens must be > 0");
        }

        uint256 electionId = electionCounter++;
        Election storage newElection = elections[electionId];
        
        newElection.id = electionId;
        newElection.title = _title;
        newElection.description = _description;
        newElection.creator = msg.sender;
        newElection.startTime = block.timestamp;
        newElection.endTime = block.timestamp + _durationInSeconds;
        newElection.status = ElectionStatus.Active;
        newElection.eligibility = _eligibility;
        newElection.minTokensRequired = _minTokensRequired;
        newElection.tokenAddress = _tokenAddress;
        newElection.totalVotes = 0;
        newElection.options = _options;
        newElection.exists = true;

        userElections[msg.sender].push(electionId);

        emit ElectionCreated(
            electionId,
            msg.sender,
            _title,
            newElection.startTime,
            newElection.endTime
        );

        return electionId;
    }

    /**
     * @dev Cast a vote in an election
     * @param _electionId The election ID
     * @param _optionIndex The index of the chosen option
     */
    function vote(uint256 _electionId, uint256 _optionIndex) 
        external 
        nonReentrant
        electionExists(_electionId)
        canVote(_electionId)
    {
        Election storage election = elections[_electionId];
        require(_optionIndex < election.options.length, "Invalid option");

        election.hasVoted[msg.sender] = true;
        election.voterChoice[msg.sender] = _optionIndex;
        election.optionVotes[_optionIndex]++;
        election.totalVotes++;

        // Auto-complete election if time has passed
        if (block.timestamp > election.endTime) {
            election.status = ElectionStatus.Completed;
            emit ElectionStatusChanged(_electionId, ElectionStatus.Active, ElectionStatus.Completed);
        }

        emit VoteCast(_electionId, msg.sender, _optionIndex, block.timestamp);
    }

    /**
     * @dev Add voters to whitelist (only election creator)
     * @param _electionId The election ID
     * @param _voters Array of voter addresses to whitelist
     */
    function addToWhitelist(uint256 _electionId, address[] memory _voters) 
        external 
        electionExists(_electionId)
        onlyElectionCreator(_electionId)
    {
        Election storage election = elections[_electionId];
        require(election.eligibility == VoterEligibility.Whitelist, "Not a whitelist election");
        
        for (uint256 i = 0; i < _voters.length; i++) {
            election.whitelist[_voters[i]] = true;
            emit VoterWhitelisted(_electionId, _voters[i]);
        }
    }

    /**
     * @dev End an election early (only creator)
     * @param _electionId The election ID
     */
    function endElection(uint256 _electionId) 
        external 
        electionExists(_electionId)
        onlyElectionCreator(_electionId)
    {
        Election storage election = elections[_electionId];
        require(election.status == ElectionStatus.Active, "Election not active");
        
        election.status = ElectionStatus.Completed;
        emit ElectionStatusChanged(_electionId, ElectionStatus.Active, ElectionStatus.Completed);
    }

    /**
     * @dev Cancel an election (only creator, before it ends)
     * @param _electionId The election ID
     */
    function cancelElection(uint256 _electionId) 
        external 
        electionExists(_electionId)
        onlyElectionCreator(_electionId)
    {
        Election storage election = elections[_electionId];
        require(election.status == ElectionStatus.Active, "Election not active");
        require(election.totalVotes == 0, "Cannot cancel election with votes");
        
        election.status = ElectionStatus.Cancelled;
        emit ElectionStatusChanged(_electionId, ElectionStatus.Active, ElectionStatus.Cancelled);
    }

    // View functions

    /**
     * @dev Get election details
     * @param _electionId The election ID
     */
    function getElection(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId)
        returns (
            uint256 id,
            string memory title,
            string memory description,
            address creator,
            uint256 startTime,
            uint256 endTime,
            ElectionStatus status,
            VoterEligibility eligibility,
            uint256 minTokensRequired,
            address tokenAddress,
            uint256 totalVotes,
            string[] memory options
        )
    {
        Election storage election = elections[_electionId];
        return (
            election.id,
            election.title,
            election.description,
            election.creator,
            election.startTime,
            election.endTime,
            election.status,
            election.eligibility,
            election.minTokensRequired,
            election.tokenAddress,
            election.totalVotes,
            election.options
        );
    }

    /**
     * @dev Get election results
     * @param _electionId The election ID
     */
    function getElectionResults(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId)
        returns (uint256[] memory voteCounts, uint256[] memory percentages)
    {
        Election storage election = elections[_electionId];
        uint256 optionCount = election.options.length;
        
        voteCounts = new uint256[](optionCount);
        percentages = new uint256[](optionCount);
        
        for (uint256 i = 0; i < optionCount; i++) {
            voteCounts[i] = election.optionVotes[i];
            if (election.totalVotes > 0) {
                percentages[i] = (voteCounts[i] * 100) / election.totalVotes;
            }
        }
        
        return (voteCounts, percentages);
    }

    /**
     * @dev Check if address has voted
     * @param _electionId The election ID
     * @param _voter The voter address
     */
    function hasVoted(uint256 _electionId, address _voter) 
        external 
        view 
        electionExists(_electionId)
        returns (bool)
    {
        return elections[_electionId].hasVoted[_voter];
    }

    /**
     * @dev Get voter's choice
     * @param _electionId The election ID
     * @param _voter The voter address
     */
    function getVoterChoice(uint256 _electionId, address _voter) 
        external 
        view 
        electionExists(_electionId)
        returns (uint256)
    {
        require(elections[_electionId].hasVoted[_voter], "Voter has not voted");
        return elections[_electionId].voterChoice[_voter];
    }

    /**
     * @dev Check if address is whitelisted
     * @param _electionId The election ID
     * @param _voter The voter address
     */
    function isWhitelisted(uint256 _electionId, address _voter) 
        external 
        view 
        electionExists(_electionId)
        returns (bool)
    {
        return elections[_electionId].whitelist[_voter];
    }

    /**
     * @dev Get all election IDs
     */
    function getAllElections() external view returns (uint256[] memory) {
        uint256[] memory allElections = new uint256[](electionCounter);
        for (uint256 i = 0; i < electionCounter; i++) {
            allElections[i] = i;
        }
        return allElections;
    }

    /**
     * @dev Get elections created by a user
     * @param _creator The creator address
     */
    function getUserElections(address _creator) 
        external 
        view 
        returns (uint256[] memory)
    {
        return userElections[_creator];
    }

    /**
     * @dev Get active elections
     */
    function getActiveElections() external view returns (uint256[] memory) {
        uint256[] memory activeElections = new uint256[](electionCounter);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < electionCounter; i++) {
            if (elections[i].exists && 
                elections[i].status == ElectionStatus.Active &&
                block.timestamp <= elections[i].endTime) {
                activeElections[activeCount] = i;
                activeCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeElections[i];
        }
        
        return result;
    }

    /**
     * @dev Update election status based on time (can be called by anyone)
     * @param _electionId The election ID
     */
    function updateElectionStatus(uint256 _electionId) 
        external 
        electionExists(_electionId)
    {
        Election storage election = elections[_electionId];
        
        if (election.status == ElectionStatus.Active && 
            block.timestamp > election.endTime) {
            election.status = ElectionStatus.Completed;
            emit ElectionStatusChanged(_electionId, ElectionStatus.Active, ElectionStatus.Completed);
        }
    }
}
