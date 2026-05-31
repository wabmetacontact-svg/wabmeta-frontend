import React, { useState, useEffect } from 'react';
import { X, Users, Check, Search, Plus } from 'lucide-react';
import api from '../../services/api';

interface Group {
  id: string;
  name: string;
  contactCount: number;
}

interface AddToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContactIds: string[];
  onSuccess: () => void;
}

const AddToGroupModal: React.FC<AddToGroupModalProps> = ({
  isOpen,
  onClose,
  selectedContactIds,
  onSuccess,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For creating a new group on the fly
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
      setSelectedGroupId('');
      setSearchQuery('');
      setIsCreatingNew(false);
      setNewGroupName('');
      setError(null);
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contacts/groups/all');
      const groupsData = res.data?.data || [];
      setGroups(groupsData.map((g: any) => ({
        id: g.id,
        name: g.name,
        contactCount: g.contactCount || g._count?.members || 0,
      })));
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroupAndAdd = async () => {
    if (!newGroupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // 1. Create group
      const res = await api.post('/contacts/groups', { name: newGroupName });
      const newGroup = res.data.data;
      
      // 2. Add contacts to this new group
      await api.post(`/contacts/groups/${newGroup.id}/contacts`, {
        contactIds: selectedContactIds
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create group or add contacts');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToExistingGroup = async () => {
    if (!selectedGroupId) {
      setError('Please select a group');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/contacts/groups/${selectedGroupId}/contacts`, {
        contactIds: selectedContactIds
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to add contacts to group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (isCreatingNew) {
      handleCreateGroupAndAdd();
    } else {
      handleAddToExistingGroup();
    }
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
      />
      
      <div className="relative w-full max-w-md bg-[#0a0e27] border border-white/[0.1] rounded-2xl shadow-xl animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.1]">
          <div>
            <h2 className="text-xl font-bold text-white">Add to Group</h2>
            <p className="text-sm text-gray-400 mt-1">
              Adding {selectedContactIds.length} contact(s)
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Toggle between existing and new group */}
          <div className="flex bg-[#050816] p-1 rounded-xl">
            <button
              onClick={() => setIsCreatingNew(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                !isCreatingNew 
                  ? 'bg-[#0a0e27] text-white shadow-sm border border-white/[0.1]' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Existing Group
            </button>
            <button
              onClick={() => setIsCreatingNew(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCreatingNew 
                  ? 'bg-[#0a0e27] text-white shadow-sm border border-white/[0.1]' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              New Group
            </button>
          </div>

          {isCreatingNew ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., VIP Customers"
                  className="w-full px-4 py-2.5 bg-[#050816] border border-white/[0.1] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups..."
                  className="w-full pl-9 pr-4 py-2 bg-[#050816] border border-white/[0.1] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors text-sm"
                />
              </div>

              {/* Group List */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loading ? (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    Loading groups...
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500 text-sm">No groups found</p>
                    <button 
                      onClick={() => setIsCreatingNew(true)}
                      className="mt-2 text-green-400 hover:text-green-300 text-sm font-medium"
                    >
                      Create a new group
                    </button>
                  </div>
                ) : (
                  filteredGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedGroupId === group.id
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-[#050816] border-white/[0.05] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          selectedGroupId === group.id ? 'bg-green-500/20 text-green-400' : 'bg-white/[0.04] text-gray-400'
                        }`}>
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className={`font-medium ${selectedGroupId === group.id ? 'text-green-400' : 'text-white'}`}>
                            {group.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {group.contactCount} contacts
                          </p>
                        </div>
                      </div>
                      
                      {selectedGroupId === group.id && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-white/[0.1] flex justify-end gap-3 bg-[#050816] rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || (!isCreatingNew && !selectedGroupId) || (isCreatingNew && !newGroupName.trim())}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : isCreatingNew ? (
              <Plus className="w-4 h-4" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {submitting ? 'Saving...' : isCreatingNew ? 'Create & Add' : 'Add to Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToGroupModal;
