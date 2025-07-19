import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/use-wallet";
import { VotingContract, Election, formatAddress } from "@/lib/contracts";
import {
  Vote,
  ArrowLeft,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    isConnected,
    address: walletAddress,
    connectWallet,
    isConnecting,
  } = useWallet();

  useEffect(() => {
    if (id) {
      loadElection(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (election && walletAddress) {
      checkIfVoted();
    }
  }, [election, walletAddress]);

  const loadElection = async (electionId: number) => {
    setLoading(true);
    try {
      // Mock contract instance
      const contract = new VotingContract("mock-address", null);
      const electionData = await contract.getElection(electionId);
      setElection(electionData);
    } catch (error) {
      console.error("Error loading election:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfVoted = async () => {
    if (!election || !walletAddress) return;

    try {
      const contract = new VotingContract("mock-address", null);
      const voted = await contract.hasVoted(election.id, walletAddress);
      setHasVoted(voted);
    } catch (error) {
      console.error("Error checking vote status:", error);
    }
  };

  const castVote = async () => {
    if (!election || selectedOption === null || !walletAddress) return;

    setIsVoting(true);
    try {
      const contract = new VotingContract("mock-address", null);
      const result = await contract.vote(election.id, selectedOption);

      if (result.success) {
        setVoteSuccess(true);
        setHasVoted(true);
        // Reload election data to get updated vote counts
        await loadElection(election.id);
      } else {
        console.error("Vote failed:", result.error);
      }
    } catch (error) {
      console.error("Error casting vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatTimeRemaining = (endTime: number) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading election...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Election Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The election you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button variant="outline" className="cyber-border">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Elections
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 hover-glow p-2 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Elections</span>
            </Link>

            <div className="flex items-center space-x-2">
              <Vote className="h-6 w-6 text-neon-cyan" />
              <span className="text-xl font-bold gradient-text">VoteChain</span>
            </div>

            {!isConnected && (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-neon-cyan text-black hover:bg-neon-cyan/90"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Election Header */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Card className="glass-card mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2 gradient-text">
                    {election.title}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {election.description}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    election.status === "active" ? "default" : "secondary"
                  }
                  className={
                    election.status === "active"
                      ? "bg-neon-cyan text-black"
                      : ""
                  }
                >
                  {election.status === "active" && (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {election.status === "completed" && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {election.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="glass-card p-4 text-center">
                  <Users className="h-6 w-6 text-neon-cyan mx-auto mb-2" />
                  <div className="text-xl font-bold">{election.totalVotes}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Votes
                  </div>
                </div>

                <div className="glass-card p-4 text-center">
                  <Clock className="h-6 w-6 text-neon-purple mx-auto mb-2" />
                  <div className="text-xl font-bold">
                    {formatTimeRemaining(election.endTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">Time Left</div>
                </div>

                <div className="glass-card p-4 text-center">
                  <Vote className="h-6 w-6 text-neon-blue mx-auto mb-2" />
                  <div className="text-xl font-bold">
                    {election.voterEligibility === "token"
                      ? `${election.minTokensRequired} Tokens`
                      : election.voterEligibility === "whitelist"
                        ? "Whitelist"
                        : "Open"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Eligibility
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Voting Section */}
        {!isConnected ? (
          <Card className="glass-card animate-slide-up">
            <CardContent className="p-8 text-center">
              <Vote className="h-16 w-16 text-neon-cyan mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground mb-6">
                You need to connect your wallet to participate in this election
              </p>
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-neon-cyan text-black hover:bg-neon-cyan/90"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </CardContent>
          </Card>
        ) : voteSuccess ? (
          <Card className="glass-card animate-slide-up">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-neon-cyan mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Vote Cast Successfully!
              </h3>
              <p className="text-muted-foreground mb-6">
                Your vote has been recorded on the blockchain. Thank you for
                participating!
              </p>
              <Button asChild variant="outline" className="cyber-border">
                <a
                  href={`https://etherscan.io/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Etherscan
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8">
            {/* Voting Options */}
            <Card className="glass-card animate-slide-up">
              <CardHeader>
                <CardTitle className="neon-text">
                  {hasVoted ? "Results" : "Cast Your Vote"}
                </CardTitle>
                <CardDescription>
                  {hasVoted
                    ? "You have already voted in this election. Here are the current results:"
                    : "Select your preferred option and cast your vote"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {election.options.map((option, index) => (
                    <div key={option.id} className="relative">
                      <div
                        className={`glass-card p-4 cursor-pointer transition-all hover-glow ${
                          selectedOption === option.id
                            ? "border-neon-cyan neon-glow"
                            : ""
                        } ${hasVoted ? "cursor-default" : ""}`}
                        onClick={() =>
                          !hasVoted && setSelectedOption(option.id)
                        }
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {!hasVoted && (
                              <div
                                className={`w-4 h-4 rounded-full border-2 ${
                                  selectedOption === option.id
                                    ? "border-neon-cyan bg-neon-cyan"
                                    : "border-border"
                                }`}
                              />
                            )}
                            <span className="font-semibold text-lg">
                              {option.name}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {option.votes} votes ({option.percentage}%)
                          </span>
                        </div>

                        <Progress value={option.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>

                {!hasVoted && election.status === "active" && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      onClick={castVote}
                      disabled={selectedOption === null || isVoting}
                      className="bg-neon-purple text-white hover:bg-neon-purple/90 px-8 py-3 text-lg"
                    >
                      {isVoting ? "Casting Vote..." : "Cast Vote"}
                    </Button>
                  </div>
                )}

                {hasVoted && (
                  <div className="mt-6 text-center">
                    <div className="glass-card p-4 inline-flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-neon-cyan" />
                      <span className="text-sm">
                        You have voted in this election
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Election Info */}
            <Card className="glass-card animate-slide-up">
              <CardHeader>
                <CardTitle className="text-xl">Election Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Creator:</span>
                    <span className="ml-2 font-mono">
                      {formatAddress(election.creator)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Time:</span>
                    <span className="ml-2">
                      {new Date(election.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Time:</span>
                    <span className="ml-2">
                      {new Date(election.endTime).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Voter Eligibility:
                    </span>
                    <span className="ml-2 capitalize">
                      {election.voterEligibility}
                      {election.minTokensRequired &&
                        ` (${election.minTokensRequired} tokens min)`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
