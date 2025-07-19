// Mock contract addresses (replace with actual deployed contract addresses)
export const CONTRACT_ADDRESSES = {
  VOTING_FACTORY: "0x742d35Cc8C3b8b3A8c3b8c3b8c3b8c3b8c3b8c3b",
  GOVERNANCE_TOKEN: "0x123d35Cc8C3b8b3A8c3b8c3b8c3b8c3b8c3b8c3b",
};

// Election interface
export interface Election {
  id: number;
  title: string;
  description: string;
  creator: string;
  startTime: number;
  endTime: number;
  status: "pending" | "active" | "completed" | "cancelled";
  totalVotes: number;
  options: ElectionOption[];
  voterEligibility: "token" | "whitelist" | "public";
  minTokensRequired?: number;
  isActive: boolean;
}

export interface ElectionOption {
  id: number;
  name: string;
  description?: string;
  votes: number;
  percentage: number;
}

// Vote interface
export interface Vote {
  voter: string;
  electionId: number;
  optionId: number;
  timestamp: number;
  transactionHash: string;
}

// Smart contract function signatures (for interaction)
export const VOTING_FACTORY_ABI = [
  {
    name: "createElection",
    type: "function",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "options", type: "string[]" },
      { name: "duration", type: "uint256" },
      { name: "eligibilityType", type: "uint8" },
      { name: "minTokensRequired", type: "uint256" },
    ],
    outputs: [{ name: "electionId", type: "uint256" }],
  },
  {
    name: "vote",
    type: "function",
    inputs: [
      { name: "electionId", type: "uint256" },
      { name: "optionId", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
  {
    name: "getElection",
    type: "function",
    inputs: [{ name: "electionId", type: "uint256" }],
    outputs: [
      {
        name: "election",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "creator", type: "address" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "totalVotes", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getAllElections",
    type: "function",
    inputs: [],
    outputs: [{ name: "elections", type: "uint256[]" }],
  },
  {
    name: "hasVoted",
    type: "function",
    inputs: [
      { name: "electionId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "voted", type: "bool" }],
  },
  {
    name: "getElectionResults",
    type: "function",
    inputs: [{ name: "electionId", type: "uint256" }],
    outputs: [
      { name: "optionNames", type: "string[]" },
      { name: "voteCounts", type: "uint256[]" },
    ],
  },
];

// Mock contract interaction functions
export class VotingContract {
  private address: string;
  private provider: any;

  constructor(address: string, provider: any) {
    this.address = address;
    this.provider = provider;
  }

  // Mock function to create an election
  async createElection(
    title: string,
    description: string,
    options: string[],
    durationDays: number,
    eligibilityType: "token" | "whitelist" | "public" = "public",
    minTokensRequired: number = 0,
  ): Promise<{ success: boolean; electionId?: number; error?: string }> {
    try {
      // Mock transaction simulation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful creation
      const electionId = Math.floor(Math.random() * 10000);

      console.log("Election created:", {
        id: electionId,
        title,
        description,
        options,
        durationDays,
        eligibilityType,
        minTokensRequired,
      });

      return { success: true, electionId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Mock function to cast a vote
  async vote(
    electionId: number,
    optionId: number,
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      // Mock transaction simulation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful vote
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      console.log("Vote cast:", {
        electionId,
        optionId,
        transactionHash,
      });

      return { success: true, transactionHash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Mock function to check if user has voted
  async hasVoted(electionId: number, voterAddress: string): Promise<boolean> {
    // Mock check - randomly return true/false for demo
    return Math.random() > 0.7;
  }

  // Mock function to get election details
  async getElection(electionId: number): Promise<Election | null> {
    // Return mock election data
    const mockElections: Election[] = [
      {
        id: 1,
        title: "DAO Treasury Allocation",
        description:
          "Vote on how to allocate 1M tokens from the community treasury",
        creator: "0x742d35Cc8C3b8b3A8c3b8c3b8c3b8c3b8c3b8c3b",
        startTime: Date.now() - 86400000, // 1 day ago
        endTime: Date.now() + 7 * 86400000, // 7 days from now
        status: "active",
        totalVotes: 1247,
        options: [
          { id: 0, name: "Development Fund", votes: 421, percentage: 34 },
          { id: 1, name: "Marketing Campaign", votes: 289, percentage: 23 },
          { id: 2, name: "Community Rewards", votes: 537, percentage: 43 },
        ],
        voterEligibility: "token",
        minTokensRequired: 100,
        isActive: true,
      },
    ];

    return mockElections.find((e) => e.id === electionId) || null;
  }

  // Mock function to get all elections
  async getAllElections(): Promise<Election[]> {
    // Return mock elections data
    return [
      {
        id: 1,
        title: "DAO Treasury Allocation",
        description:
          "Vote on how to allocate 1M tokens from the community treasury",
        creator: "0x742d35Cc8C3b8b3A8c3b8c3b8c3b8c3b8c3b8c3b",
        startTime: Date.now() - 86400000,
        endTime: Date.now() + 7 * 86400000,
        status: "active",
        totalVotes: 1247,
        options: [
          { id: 0, name: "Development Fund", votes: 421, percentage: 34 },
          { id: 1, name: "Marketing Campaign", votes: 289, percentage: 23 },
          { id: 2, name: "Community Rewards", votes: 537, percentage: 43 },
        ],
        voterEligibility: "token",
        minTokensRequired: 100,
        isActive: true,
      },
      {
        id: 2,
        title: "Protocol Upgrade v2.0",
        description: "Approve the implementation of new consensus mechanisms",
        creator: "0x742d35Cc8C3b8b3A8c3b8c3b8c3b8c3b8c3b8c3b",
        startTime: Date.now() - 2 * 86400000,
        endTime: Date.now() + 5 * 86400000,
        status: "active",
        totalVotes: 892,
        options: [
          { id: 0, name: "Approve Upgrade", votes: 634, percentage: 71 },
          { id: 1, name: "Reject Upgrade", votes: 258, percentage: 29 },
        ],
        voterEligibility: "public",
        isActive: true,
      },
    ];
  }
}

// Utility function to format addresses
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Utility function to format large numbers
export function formatVoteCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
