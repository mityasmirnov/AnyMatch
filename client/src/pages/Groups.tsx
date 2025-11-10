import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Users, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Groups() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Fetch groups
  const { data: groups, isLoading } = trpc.groups.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Create group mutation
  const createMutation = trpc.groups.create.useMutation({
    onSuccess: (data) => {
      toast.success("Group created!", {
        description: `Join code: ${data.joinCode}`,
      });
      setCreateDialogOpen(false);
      setNewGroupName("");
      utils.groups.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create group", {
        description: error.message,
      });
    },
  });

  // Join group mutation
  const joinMutation = trpc.groups.join.useMutation({
    onSuccess: (data) => {
      if (data.alreadyMember) {
        toast.info("You're already in this group!");
      } else {
        toast.success("Joined group successfully!");
      }
      setJoinDialogOpen(false);
      setJoinCode("");
      utils.groups.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to join group", {
        description: error.message,
      });
    },
  });

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    createMutation.mutate({ name: newGroupName });
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a join code");
      return;
    }
    joinMutation.mutate({ joinCode: joinCode.toUpperCase() });
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Join code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white text-shadow mb-2">
              Your Groups
            </h1>
            <p className="text-white/70">
              Create or join groups to match movies with friends
            </p>
          </div>
          <Button onClick={() => setLocation("/swipe")} className="gradient-primary">
            Start Swiping
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button flex-1">
                <Plus className="w-5 h-5 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Group</DialogTitle>
                <DialogDescription className="text-white/70">
                  Create a group to match movies with friends
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName" className="text-white">
                    Group Name
                  </Label>
                  <Input
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Friday Movie Night"
                    className="glass border-white/20 text-white"
                  />
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={createMutation.isPending}
                  className="w-full gradient-primary"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Group"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button flex-1">
                <Users className="w-5 h-5 mr-2" />
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">Join Group</DialogTitle>
                <DialogDescription className="text-white/70">
                  Enter the join code shared by your friend
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="joinCode" className="text-white">
                    Join Code
                  </Label>
                  <Input
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="glass border-white/20 text-white uppercase"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleJoinGroup}
                  disabled={joinMutation.isPending}
                  className="w-full gradient-primary"
                >
                  {joinMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Join Group"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{group.name}</span>
                    {group.role === "owner" && (
                      <span className="text-xs px-2 py-1 bg-purple-500/30 rounded-full">
                        Owner
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Join Code: {group.joinCode}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full glass border-white/20"
                    onClick={() => copyJoinCode(group.joinCode)}
                  >
                    {copiedCode === group.joinCode ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Join Code
                      </>
                    )}
                  </Button>
                  <Button
                    className="w-full gradient-accent"
                    onClick={() => setLocation(`/matches/${group.id}`)}
                  >
                    View Matches
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card">
            <Users className="w-16 h-16 mx-auto mb-4 text-white/50" />
            <p className="text-xl text-white/80 mb-2">No groups yet</p>
            <p className="text-white/60 mb-6">
              Create a group or join one to start matching movies
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gradient-primary">
              Create Your First Group
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
