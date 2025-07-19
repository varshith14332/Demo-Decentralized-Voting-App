import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Vote,
  Plus,
  Settings,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  X,
  ArrowLeft,
} from "lucide-react";

// Mock admin elections data
const adminElections = [
  {
    id: 1,
    title: "DAO Treasury Allocation",
    description:
      "Vote on how to allocate 1M tokens from the community treasury",
    status: "active",
    createdAt: "2024-12-20T10:00:00",
    endTime: "2024-12-31T23:59:59",
    totalVotes: 1247,
    participants: 856,
  },
  {
    id: 2,
    title: "Protocol Upgrade v2.0",
    description: "Approve the implementation of new consensus mechanisms",
    status: "active",
    createdAt: "2024-12-18T14:30:00",
    endTime: "2024-12-28T18:00:00",
    totalVotes: 892,
    participants: 634,
  },
  {
    id: 3,
    title: "Community Governance Rules",
    description: "Establish new voting requirements and proposal thresholds",
    status: "completed",
    createdAt: "2024-12-10T09:00:00",
    endTime: "2024-12-15T12:00:00",
    totalVotes: 2156,
    participants: 1284,
  },
];

export default function Admin() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    duration: "7",
    options: ["", ""],
  });

  const addOption = () => {
    setNewElection((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (newElection.options.length > 2) {
      setNewElection((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setNewElection((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const createElection = () => {
    // Mock creation logic
    console.log("Creating election:", newElection);
    setIsCreateDialogOpen(false);
    setNewElection({
      title: "",
      description: "",
      duration: "7",
      options: ["", ""],
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 hover-glow p-2 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Voting</span>
              </Link>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-neon-purple" />
                <span className="text-xl font-bold gradient-text">
                  Admin Dashboard
                </span>
              </div>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-neon-cyan text-black hover:bg-neon-cyan/90 neon-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Election
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-0 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="gradient-text">
                    Create New Election
                  </DialogTitle>
                  <DialogDescription>
                    Set up a new voting election for your community.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Election Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter election title"
                      value={newElection.title}
                      onChange={(e) =>
                        setNewElection((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="bg-surface-dark border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this election is about..."
                      value={newElection.description}
                      onChange={(e) =>
                        setNewElection((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="bg-surface-dark border-border/50 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={newElection.duration}
                      onValueChange={(value) =>
                        setNewElection((prev) => ({ ...prev, duration: value }))
                      }
                    >
                      <SelectTrigger className="bg-surface-dark border-border/50">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="7">1 Week</SelectItem>
                        <SelectItem value="14">2 Weeks</SelectItem>
                        <SelectItem value="30">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Voting Options</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="cyber-border"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {newElection.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) =>
                              updateOption(index, e.target.value)
                            }
                            className="bg-surface-dark border-border/50"
                          />
                          {newElection.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="cyber-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createElection}
                      className="bg-neon-purple text-white hover:bg-neon-purple/90"
                      disabled={
                        !newElection.title ||
                        !newElection.description ||
                        newElection.options.some((opt) => !opt.trim())
                      }
                    >
                      Create Election
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Elections
                  </p>
                  <p className="text-2xl font-bold text-neon-cyan">
                    {adminElections.length}
                  </p>
                </div>
                <Vote className="h-8 w-8 text-neon-cyan" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Elections
                  </p>
                  <p className="text-2xl font-bold text-neon-purple">
                    {adminElections.filter((e) => e.status === "active").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-neon-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                  <p className="text-2xl font-bold text-neon-blue">
                    {adminElections
                      .reduce((sum, e) => sum + e.totalVotes, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-neon-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold text-neon-cyan">
                    {Math.max(
                      ...adminElections.map((e) => e.participants),
                    ).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-neon-cyan" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elections Management */}
        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="neon-text">Manage Elections</CardTitle>
            <CardDescription>
              Monitor and manage all voting elections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminElections.map((election, index) => (
                <div
                  key={election.id}
                  className="glass-card p-4 cyber-border hover-glow"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {election.title}
                        </h3>
                        <Badge
                          variant={
                            election.status === "active"
                              ? "default"
                              : "secondary"
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
                      <p className="text-muted-foreground text-sm mb-3">
                        {election.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span>Created: {formatDate(election.createdAt)}</span>
                        <span>Ends: {formatDate(election.endTime)}</span>
                        <span>{election.totalVotes} votes</span>
                        <span>{election.participants} participants</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cyber-border"
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                      {election.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="cyber-border"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
