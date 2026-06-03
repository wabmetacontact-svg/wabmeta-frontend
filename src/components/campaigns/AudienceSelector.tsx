// src/components/campaigns/AudienceSelector.tsx - COMPLETE (Group added, CSV removed)

import React, { useState, useEffect } from 'react';
import {
  Users,
  Tag,
  UserPlus,
  Search,
  Check,
  Layers,
  Loader2,
  FileText,
  X,
} from 'lucide-react';
import api from '../../services/api';

// Types
export type AudienceType = 'all' | 'tags' | 'manual' | 'group' | 'csv';

interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
}

interface Group {
  id: string;
  name: string;
  count: number;
}

interface AudienceSelectorProps {
  audienceType: AudienceType;
  onTypeChange: (type: AudienceType) => void;
  // Tags
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  // Manual
  selectedContacts: string[];
  onContactsChange: (contacts: string[]) => void;
  // Group
  selectedGroup: string;
  onGroupChange: (groupId: string) => void;
  // CSV
  csvContacts?: any[];
  onCsvContactsChange?: (contacts: any[]) => void;
  // Data
  availableTags: string[];
  contacts: Contact[];
  totalSelected: number;
}

const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  audienceType,
  onTypeChange,
  selectedTags,
  onTagsChange,
  selectedContacts,
  onContactsChange,
  selectedGroup,
  onGroupChange,
  csvContacts = [],
  onCsvContactsChange,
  availableTags,
  contacts,
  totalSelected
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');

  // Load groups on mount
  useEffect(() => {
    setLoadingGroups(true);
    api.get('/contacts/groups/all')
      .then((res) => {
        const groupsData = res.data?.data || [];
        setGroups(groupsData.map((g: any) => ({
          id: g.id,
          name: g.name,
          count: g.contactCount || g._count?.members || 0,
        })));
      })
      .catch((err) => console.error('Failed to load groups', err))
      .finally(() => setLoadingGroups(false));
  }, []);

  const audienceTypes = [
    {
      value: 'all' as AudienceType,
      label: 'All Contacts',
      description: 'Send to all your contacts',
      icon: Users,
      count: contacts.length
    },
    {
      value: 'group' as AudienceType,
      label: 'By Group',
      description: 'Select a contact group',
      icon: Layers, // Group icon
      count: groups.length
    },
    {
      value: 'tags' as AudienceType,
      label: 'By Tags',
      description: 'Select contacts by tags',
      icon: Tag,
      count: null
    },
    {
      value: 'manual' as AudienceType,
      label: 'Select Manually',
      description: 'Choose specific contacts',
      icon: UserPlus,
      count: null
    },
    {
      value: 'csv' as AudienceType,
      label: 'Upload CSV',
      description: 'Upload custom contacts List',
      icon: Users,
      count: csvContacts?.length || 0
    },
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const toggleContact = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      onContactsChange(selectedContacts.filter(c => c !== contactId));
    } else {
      onContactsChange([...selectedContacts, contactId]);
    }
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      onContactsChange([]);
    } else {
      onContactsChange(contacts.map(c => c.id));
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  // Calculate contacts by tags
  const contactsByTags = selectedTags.length > 0
    ? contacts.filter(c => selectedTags.some(tag => c.tags.includes(tag))).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Audience Type Selection */}
      <div className="grid grid-cols-2 gap-3">
        {audienceTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${audienceType === type.value
                ? 'border-emerald-500 bg-emerald-500/[0.02] shadow-[inset_0_0_0_1px_rgba(16,185,129,0.4)]'
                : 'border-white/[0.05] hover:bg-emerald-500/[0.02] hover:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.4)] bg-white/[0.02]'
              }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${audienceType === type.value ? 'bg-emerald-500/20' : 'bg-white/[0.04]'
                }`}>
                <type.icon className={`w-5 h-5 ${audienceType === type.value ? 'text-emerald-500' : 'text-gray-500'
                  }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{type.label}</h4>
                  {type.count !== null && (
                    <span className="text-sm text-gray-500">{type.count}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Group Selection */}
      {audienceType === 'group' && (
        <div className="bg-white/[0.02] rounded-xl p-4 space-y-4 border border-white/[0.05] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white">Select Group</h4>
            {loadingGroups && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
          </div>

          <select
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-white/[0.05] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/[0.02] text-white transition-all hover:bg-white/[0.04]"
          >
            <option value="">-- Select a Group --</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.count} contacts)
              </option>
            ))}
          </select>

          {selectedGroup && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Group selected.
            </p>
          )}

          {groups.length === 0 && !loadingGroups && (
            <p className="text-sm text-gray-500">
              No groups found. Create groups in Contacts section first.
            </p>
          )}
        </div>
      )}

      {/* Tags Selection */}
      {audienceType === 'tags' && (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white">Select Tags</h4>
            <span className="text-sm text-gray-500">
              {contactsByTags} contacts selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                 className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/[0.02] border border-white/[0.05] text-gray-300 hover:border-emerald-500/50 hover:bg-white/[0.04]'
                  }`}
              >
                {selectedTags.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}
                {tag}
              </button>
            ))}
          </div>
          {availableTags.length === 0 && (
            <p className="text-center text-gray-500 py-4">No tags available</p>
          )}
        </div>
      )}

      {/* Manual Selection */}
      {audienceType === 'manual' && (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white">Select Contacts</h4>
            <button
              onClick={selectAllContacts}
              className="text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
            >
              {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all hover:bg-white/[0.04]"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredContacts.map((contact) => (
              <label
                key={contact.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${selectedContacts.includes(contact.id)
                    ? 'bg-emerald-500/[0.05] border border-emerald-500/30'
                    : 'bg-white/[0.02] border border-white/[0.05] hover:bg-emerald-500/[0.02] hover:border-emerald-500/30'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  className="w-4 h-4 text-emerald-500 border-white/[0.05] rounded focus:ring-emerald-500 bg-white/[0.02]"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                </div>
                {contact.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {contact.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.05] text-gray-400 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </label>
            ))}
          </div>

          <p className="text-sm text-gray-500 text-center">
            {selectedContacts.length} of {contacts.length} contacts selected
          </p>
        </div>
      )}

      {/* CSV Selection */}
      {audienceType === 'csv' && (
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-xl p-6 space-y-4 border border-dashed border-white/[0.12] text-center">
          <input 
            type="file" 
            accept=".csv" 
            id="csv-upload" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const text = event.target?.result as string;
                    // Basic fallback parser if papaparse is missing
                    const rows = text.split('\n').map(r => r.trim()).filter(Boolean);
                    if (rows.length < 2) return alert('CSV must have headers and data');
                    const headers = rows[0].split(',').map(h => h.trim());
                    const parsed = rows.slice(1).map(row => {
                      const values = row.split(',').map(v => v.trim());
                      const obj: any = {};
                      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
                      return obj;
                    });
                    
                    const formatted = parsed.map(p => ({
                       phone: p['Phone'] || p['phone'] || p['Number'] || p['number'],
                       customData: p
                    })).filter(p => p.phone);
                    
                    if (onCsvContactsChange) onCsvContactsChange(formatted);
                    setCsvFileName(file.name);
                  } catch(e) { console.error(e); alert('Failed to parse CSV'); }
                };
                reader.readAsText(file);
              }
            }}
          />
          {csvContacts && csvContacts.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-1">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-medium text-white">{csvFileName || 'Uploaded CSV'}</h4>
                <p className="text-sm text-green-600 font-medium">
                  {csvContacts.length} recipients loaded
                </p>
              </div>
              <button
                onClick={() => {
                  if (onCsvContactsChange) onCsvContactsChange([]);
                  setCsvFileName('');
                  const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
              >
                <X className="w-4 h-4" />
                Remove CSV
              </button>
            </div>
          ) : (
            <>
              <h4 className="font-medium text-white">Upload Contacts CSV</h4>
              <p className="text-sm text-gray-500">Ensure your CSV has a column named "Phone" or "Number".</p>
              <label htmlFor="csv-upload" className="inline-block mt-4 px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded cursor-pointer hover:bg-white/[0.04] font-medium text-gray-300 transition-all">
                Choose CSV File
              </label>
            </>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white/[0.02] border border-emerald-500/20 rounded-xl p-4 backdrop-blur-xl shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <span className="font-medium text-white">Total Recipients</span>
          </div>
          <span className="text-2xl font-bold text-emerald-500">
            {totalSelected.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudienceSelector;