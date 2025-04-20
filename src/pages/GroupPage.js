import React, { useState, useEffect } from 'react';
import { GroupManagement } from '../components/GroupManagement';
import { useGroup } from '../contexts/GroupContext';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const GroupPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    groups, 
    loading: groupLoading, 
    createGroup, 
    joinGroup, 
    leaveGroup, 
    selectGroup 
  } = useGroup();
  
  // If user is not authenticated, redirect to auth page
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  const handleCreateGroup = async (name) => {
    try {
      await createGroup(name);
    } catch (error) {
      console.error("Error in handleCreateGroup:", error);
    }
  };
  
  const handleJoinGroup = async (code) => {
    try {
      await joinGroup(code);
    } catch (error) {
      console.error("Error in handleJoinGroup:", error);
    }
  };
  
  const handleLeaveGroup = async (groupId) => {
    try {
      await leaveGroup(groupId);
    } catch (error) {
      console.error("Error in handleLeaveGroup:", error);
    }
  };
  
  const handleSelectGroup = (groupId) => {
    selectGroup(groupId);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Your Movie Groups</h1>
          <p className="mt-2 text-lg text-gray-600">
            Create or join groups to match movies with friends and family
          </p>
        </div>
        
        {(authLoading || groupLoading) ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading groups...</p>
          </div>
        ) : (
          <GroupManagement
            groups={groups.map(group => ({
              id: group.id,
              name: group.name,
              members: group.members,
              joinCode: group.joinCode
            }))}
            onCreateGroup={handleCreateGroup}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onSelectGroup={handleSelectGroup}
          />
        )}
      </div>
    </div>
  );
};

export default GroupPage;
