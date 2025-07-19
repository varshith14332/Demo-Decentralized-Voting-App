import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Vote,
  Wallet,
  Shield,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

// Mock data for elections
const elections = [
  {
    id: 1,
    title: "DAO Treasury Allocation",
    description:
      "Vote on how to allocate 1M tokens from the community treasury",
    status: "active",
    endTime: "2024-12-31T23:59:59",
    totalVotes: 1247,
    options: [
      { name: "Development Fund", votes: 421, percentage: 34 },
      { name: "Marketing Campaign", votes: 289, percentage: 23 },
      { name: "Community Rewards", votes: 537, percentage: 43 },
    ],
  },
  {
    id: 2,
    title: "Protocol Upgrade v2.0",
    description: "Approve the implementation of new consensus mechanisms",
    status: "active",
    endTime: "2024-12-28T18:00:00",
    totalVotes: 892,
    options: [
      { name: "Approve Upgrade", votes: 634, percentage: 71 },
      { name: "Reject Upgrade", votes: 258, percentage: 29 },
    ],
  },
  {
    id: 3,
    title: "Community Governance Rules",
    description: "Establish new voting requirements and proposal thresholds",
    status: "completed",
    endTime: "2024-12-15T12:00:00",
    totalVotes: 2156,
    options: [
      { name: "Option A", votes: 1284, percentage: 60 },
      { name: "Option B", votes: 872, percentage: 40 },
    ],
  },
];

export default function Index() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);

    // Mock wallet connection - in real implementation, use MetaMask
    setTimeout(() => {
      setIsConnected(true);
      setWalletAddress("0x742d35Cc8C3b8b3A8c3b8c3b8c3b8c3b8c3b8c3b");
      setIsConnecting(false);
    }, 2000);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
  };

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h remaining`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Vote className="h-8 w-8 text-neon-cyan" />
              <span className="text-2xl font-bold gradient-text">
                VoteChain
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="hover-glow">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>

              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="glass-card px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-neon-cyan rounded-full animate-glow-pulse"></div>
                      <span className="text-sm font-mono">
                        {walletAddress?.slice(0, 6)}...
                        {walletAddress?.slice(-4)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-neon-cyan text-black hover:bg-neon-cyan/90 neon-glow"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 gradient-text">
            Decentralized Voting
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transparent, secure, and democratic decision-making powered by
            blockchain technology. Your voice matters in shaping the future.
          </p>

          {!isConnected && (
            <div className="glass-card p-6 max-w-md mx-auto cyber-border">
              <Wallet className="h-12 w-12 text-neon-cyan mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Web3 wallet to participate in voting
              </p>
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/90"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      {isConnected && (
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
            <Card className="glass-card hover-glow">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-neon-cyan mx-auto mb-2" />
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">
                  Active Voters
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-glow">
              <CardContent className="p-6 text-center">
                <Vote className="h-8 w-8 text-neon-purple mx-auto mb-2" />
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">
                  Active Elections
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-glow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-neon-blue mx-auto mb-2" />
                <div className="text-2xl font-bold">98.7%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-glow">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-neon-cyan mx-auto mb-2" />
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">Transparent</div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Elections Section */}
      {isConnected && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold neon-text">Active Elections</h2>
            <Link to="/admin">
              <Button variant="outline" className="cyber-border">
                Create Election
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {elections.map((election, index) => (
              <Card
                key={election.id}
                className={`glass-card hover-glow animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {election.title}
                      </CardTitle>
                      <CardDescription className="text-base">
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

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{election.totalVotes} votes cast</span>
                    <span>{formatTimeRemaining(election.endTime)}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {election.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{option.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {option.votes} votes ({option.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-500"
                            style={{ width: `${option.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {election.status === "active" && (
                    <div className="mt-6">
                      <Button className="w-full bg-neon-purple text-white hover:bg-neon-purple/90">
                        Cast Your Vote
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 VoteChain. Powered by blockchain technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
