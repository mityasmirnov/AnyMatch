'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getUserGroups, createGroup, joinGroup, leaveGroup, getGroupWatchlist } from '../services/firestore';
import { useToast } from '../components/ui/toast-provider';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function GroupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [groups, setGroups] = useState([]);
  const [matchesCount, setMatchesCount] = useState({});
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const loadGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
      const counts = {};
      for (const g of userGroups) {
        const list = await getGroupWatchlist(g.id);
        counts[g.id] = list.length;
      }
      setMatchesCount(counts);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load groups', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGroups(); }, [user]);

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createGroup(user.uid, newGroupName.trim());
      setNewGroupName('');
      toast({ title: 'Group Created', description: newGroupName.trim(), variant: 'success' });
      loadGroups();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create group', variant: 'error' });
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      await joinGroup(user.uid, joinCode.trim());
      setJoinCode('');
      toast({ title: 'Joined Group', description: joinCode.trim(), variant: 'success' });
      loadGroups();
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to join group', variant: 'error' });
    }
  };

  const handleLeave = async (groupId) => {
    try {
      await leaveGroup(user.uid, groupId);
      toast({ title: 'Group Left', description: '', variant: 'success' });
      loadGroups();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to leave group', variant: 'error' });
    }
  };

  const handleSelect = (groupId) => {
    router.push(`/swipe?group=${groupId}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Groups</h1>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="New group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleCreate} disabled={!newGroupName.trim()}>Create Group</Button>
        </div>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleJoin} disabled={!joinCode.trim()}>Join Group</Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {groups.map((g) => (
              <Card key={g.id}>
                <CardHeader>
                  <CardTitle>{g.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Participants: {g.members.length}</p>
                  <p>Matches: {matchesCount[g.id] || 0}</p>
                  <p>Type: Movie</p>
                  <p className="mt-2 text-gray-900 dark:text-gray-100">
                    Invite Code: <span className="font-mono bg-gray-100 px-1 rounded dark:bg-gray-800 dark:text-gray-100">{g.joinCode}</span>
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleSelect(g.id)}>Select</Button>
                    <Button variant="destructive" onClick={() => handleLeave(g.id)}>Remove</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
