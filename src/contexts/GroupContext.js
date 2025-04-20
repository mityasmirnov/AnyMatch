import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Toast, useToast } from '../components/ui/toast';

// Create context
const GroupContext = createContext(null);

// Generate a random 6-character join code
const generateJoinCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const db = getFirestore();

  // Fetch user's groups when user changes
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) {
        setGroups([]);
        setCurrentGroup(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Get groups where user is a member
        const q = query(
          collection(db, 'groups'),
          where('memberIds', 'array-contains', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedGroups = [];
        
        querySnapshot.forEach((doc) => {
          fetchedGroups.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setGroups(fetchedGroups);
        
        // Set current group to the first one if none is selected
        if (fetchedGroups.length > 0 && !currentGroup) {
          setCurrentGroup(fetchedGroups[0]);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast({
          title: "Error",
          description: "Failed to load your groups.",
          variant: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user, db]);

  // Create a new group
  const createGroup = async (name) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Generate a unique join code
      const joinCode = generateJoinCode();
      
      // Create group document
      const groupRef = doc(collection(db, 'groups'));
      const newGroup = {
        name,
        joinCode,
        createdBy: user.uid,
        createdAt: new Date(),
        memberIds: [user.uid],
        members: [{
          id: user.uid,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || '',
        }],
        preferences: {
          genres: [],
          minRating: 0
        }
      };
      
      await setDoc(groupRef, newGroup);
      
      // Add to local state
      const groupWithId = {
        id: groupRef.id,
        ...newGroup
      };
      
      setGroups(prev => [...prev, groupWithId]);
      setCurrentGroup(groupWithId);
      
      toast({
        title: "Group created",
        description: `Your group "${name}" has been created successfully.`,
        variant: "success"
      });
      
      return groupWithId;
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group.",
        variant: "error"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Join a group using join code
  const joinGroup = async (joinCode) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Find group with the join code
      const q = query(
        collection(db, 'groups'),
        where('joinCode', '==', joinCode.toUpperCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          title: "Invalid code",
          description: "No group found with this join code.",
          variant: "error"
        });
        return null;
      }
      
      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();
      
      // Check if user is already a member
      if (groupData.memberIds.includes(user.uid)) {
        toast({
          title: "Already a member",
          description: "You are already a member of this group.",
          variant: "info"
        });
        
        // Return the group and set as current
        const existingGroup = {
          id: groupDoc.id,
          ...groupData
        };
        
        setCurrentGroup(existingGroup);
        return existingGroup;
      }
      
      // Add user to the group
      const memberInfo = {
        id: user.uid,
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || '',
      };
      
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        memberIds: arrayUnion(user.uid),
        members: arrayUnion(memberInfo)
      });
      
      // Add to local state
      const updatedGroup = {
        id: groupDoc.id,
        ...groupData,
        memberIds: [...groupData.memberIds, user.uid],
        members: [...groupData.members, memberInfo]
      };
      
      setGroups(prev => [...prev, updatedGroup]);
      setCurrentGroup(updatedGroup);
      
      toast({
        title: "Group joined",
        description: `You have joined "${groupData.name}" successfully.`,
        variant: "success"
      });
      
      return updatedGroup;
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "Failed to join group.",
        variant: "error"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Leave a group
  const leaveGroup = async (groupId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        toast({
          title: "Group not found",
          description: "The group you're trying to leave doesn't exist.",
          variant: "error"
        });
        return;
      }
      
      const groupData = groupDoc.data();
      
      // If user is the creator and there are other members, transfer ownership
      if (groupData.createdBy === user.uid && groupData.memberIds.length > 1) {
        // Find another member to transfer ownership to
        const newOwner = groupData.memberIds.find(id => id !== user.uid);
        
        await updateDoc(groupRef, {
          createdBy: newOwner,
          memberIds: arrayRemove(user.uid),
          members: groupData.members.filter(member => member.id !== user.uid)
        });
      } 
      // If user is the only member or not the creator, just remove them
      else if (groupData.memberIds.length > 1 || groupData.createdBy !== user.uid) {
        await updateDoc(groupRef, {
          memberIds: arrayRemove(user.uid),
          members: groupData.members.filter(member => member.id !== user.uid)
        });
      } 
      // If user is the creator and the only member, delete the group
      else {
        await deleteDoc(groupRef);
      }
      
      // Update local state
      setGroups(prev => prev.filter(group => group.id !== groupId));
      
      // If current group is the one being left, set to another group or null
      if (currentGroup && currentGroup.id === groupId) {
        const remainingGroups = groups.filter(group => group.id !== groupId);
        setCurrentGroup(remainingGroups.length > 0 ? remainingGroups[0] : null);
      }
      
      toast({
        title: "Group left",
        description: "You have left the group successfully.",
        variant: "success"
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: "Failed to leave group.",
        variant: "error"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Select a group as current
  const selectGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setCurrentGroup(group);
      return true;
    }
    return false;
  };

  // Update group preferences
  const updateGroupPreferences = async (groupId, preferences) => {
    if (!user) return;
    
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        toast({
          title: "Group not found",
          description: "The group you're trying to update doesn't exist.",
          variant: "error"
        });
        return;
      }
      
      await updateDoc(groupRef, {
        preferences: {
          ...groupDoc.data().preferences,
          ...preferences
        }
      });
      
      // Update local state
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId 
            ? {
                ...group, 
                preferences: {
                  ...group.preferences,
                  ...preferences
                }
              } 
            : group
        )
      );
      
      if (currentGroup && currentGroup.id === groupId) {
        setCurrentGroup(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            ...preferences
          }
        }));
      }
      
      toast({
        title: "Preferences updated",
        description: "Group preferences have been updated successfully.",
        variant: "success"
      });
    } catch (error) {
      console.error("Error updating group preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update group preferences.",
        variant: "error"
      });
      throw error;
    }
  };

  // Context value
  const value = {
    groups,
    currentGroup,
    loading,
    createGroup,
    joinGroup,
    leaveGroup,
    selectGroup,
    updateGroupPreferences
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};

// Custom hook to use group context
export const useGroup = () => {
  const context = useContext(GroupContext);
  if (context === null) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};
