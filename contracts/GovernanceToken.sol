// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceToken
 * @dev ERC20 token with voting capabilities for DAO governance
 * @author VoteChain Team
 */
contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    
    // Token configuration
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10B tokens max
    
    // Minting limits
    uint256 public constant MINT_CAP_PERCENTAGE = 2; // 2% of total supply per year
    uint256 public lastMintTimestamp;
    uint256 public mintedThisYear;
    
    // Delegation tracking
    mapping(address => address) public delegatedTo;
    mapping(address => uint256) public delegatedVotes;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event DelegationChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    constructor() 
        ERC20("VoteChain Governance Token", "VOTE") 
        ERC20Permit("VoteChain Governance Token")
    {
        _mint(msg.sender, INITIAL_SUPPLY);
        lastMintTimestamp = block.timestamp;
    }

    /**
     * @dev Mint new tokens (subject to annual cap)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check if a year has passed since last mint timestamp
        if (block.timestamp >= lastMintTimestamp + 365 days) {
            lastMintTimestamp = block.timestamp;
            mintedThisYear = 0;
        }
        
        // Calculate annual mint cap
        uint256 currentSupply = totalSupply();
        uint256 annualMintCap = (currentSupply * MINT_CAP_PERCENTAGE) / 100;
        
        require(
            mintedThisYear + amount <= annualMintCap,
            "Would exceed annual mint cap"
        );
        
        require(
            currentSupply + amount <= MAX_SUPPLY,
            "Would exceed maximum supply"
        );
        
        mintedThisYear += amount;
        _mint(to, amount);
        
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from specified account (requires allowance)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }

    /**
     * @dev Delegate voting power to another address
     * @param delegatee Address to delegate votes to
     */
    function delegate(address delegatee) public override {
        address currentDelegate = delegates(msg.sender);
        
        super.delegate(delegatee);
        
        emit DelegationChanged(msg.sender, currentDelegate, delegatee);
    }

    /**
     * @dev Delegate voting power using signature
     * @param delegatee Address to delegate votes to
     * @param nonce Nonce for replay protection
     * @param expiry Timestamp when signature expires
     * @param v ECDSA signature parameter
     * @param r ECDSA signature parameter
     * @param s ECDSA signature parameter
     */
    function delegateBySig(
        address delegatee,
        uint256 nonce,
        uint256 expiry,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override {
        address currentDelegate = delegates(msg.sender);
        
        super.delegateBySig(delegatee, nonce, expiry, v, r, s);
        
        emit DelegationChanged(msg.sender, currentDelegate, delegatee);
    }

    /**
     * @dev Get the voting power of an account at a specific block
     * @param account Address to check voting power for
     * @param blockNumber Block number to check at
     */
    function getPastVotes(address account, uint256 blockNumber) 
        public 
        view 
        override 
        returns (uint256) 
    {
        return super.getPastVotes(account, blockNumber);
    }

    /**
     * @dev Get the current voting power of an account
     * @param account Address to check voting power for
     */
    function getVotes(address account) public view override returns (uint256) {
        return super.getVotes(account);
    }

    /**
     * @dev Get the current delegate of an account
     * @param account Address to check delegate for
     */
    function delegates(address account) public view override returns (address) {
        return super.delegates(account);
    }

    /**
     * @dev Check if an account has enough voting power
     * @param account Address to check
     * @param requiredVotes Minimum votes required
     */
    function hasVotingPower(address account, uint256 requiredVotes) 
        external 
        view 
        returns (bool) 
    {
        return getVotes(account) >= requiredVotes;
    }

    /**
     * @dev Get voting power percentage of total supply
     * @param account Address to check
     */
    function getVotingPercentage(address account) external view returns (uint256) {
        uint256 votes = getVotes(account);
        uint256 supply = totalSupply();
        
        if (supply == 0) return 0;
        return (votes * 10000) / supply; // Returns percentage * 100 (e.g., 550 = 5.5%)
    }

    /**
     * @dev Calculate the minimum tokens needed for a percentage of voting power
     * @param percentage Percentage * 100 (e.g., 500 = 5%)
     */
    function getTokensForPercentage(uint256 percentage) external view returns (uint256) {
        return (totalSupply() * percentage) / 10000;
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

    /**
     * @dev Emergency pause function (only owner)
     * Note: This would require importing Pausable if needed
     */
    function emergencyPause() external onlyOwner {
        // Implementation would go here if Pausable is imported
        // _pause();
    }

    /**
     * @dev Get contract information
     */
    function getContractInfo() external view returns (
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply,
        uint256 maxSupply,
        uint256 mintCapPercentage,
        uint256 lastMint,
        uint256 mintedThisYear
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            MAX_SUPPLY,
            MINT_CAP_PERCENTAGE,
            lastMintTimestamp,
            mintedThisYear
        );
    }
}
