import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

const GroupManagement = ({
  groups = [],
  onCreateGroup,
  onJoinGroup,
  onLeaveGroup,
  onSelectGroup,
  className = '',
  ...props
}) => {
  const [newGroupName, setNewGroupName] = React.useState('');
  const [joinCode, setJoinCode] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('myGroups'); // 'myGroups' or 'join'

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleJoinGroup = () => {
    if (joinCode.trim()) {
      onJoinGroup(joinCode.trim());
      setJoinCode('');
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Your Movie Groups</CardTitle>
          <div className="flex border-b mt-4">
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === 'myGroups' ? 'border-b-2 border-primary-500 text-primary-600 font-medium' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('myGroups')}
            >
              My Groups
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === 'join' ? 'border-b-2 border-primary-500 text-primary-600 font-medium' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('join')}
            >
              Join Group
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'myGroups' && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Create New Group</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                    Create
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-medium mb-2">Your Groups</h3>
              {groups.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  You haven't created or joined any groups yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{group.name}</h4>
                          <p className="text-sm text-gray-500">
                            {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                          </p>
                          {group.joinCode && (
                            <p className="text-xs text-gray-500 mt-1">
                              Join code: <span className="font-mono font-medium">{group.joinCode}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectGroup(group.id)}
                          >
                            Select
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onLeaveGroup(group.id)}
                          >
                            Leave
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'join' && (
            <div>
              <h3 className="text-lg font-medium mb-2">Join Existing Group</h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter the join code provided by the group creator.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Join code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleJoinGroup} disabled={!joinCode.trim()}>
                  Join
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { GroupManagement };
