// src/components/campaigns/AudienceSelector.tsx - FIXED
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users, Tag, UserPlus, Search, Check, Layers,
  Loader2, FileText, X,
} from 'lucide-react';
import { contacts as contactsApi } from '../../services/api';
import api from '../../services/api';

// ─── Types ───────────────────────────────────────────────────
export type AudienceType = 'all' | 'tags' | 'manual' | 'group' | 'csv';

interface Contact {
  id:    string;
  name:  string;
  phone: string;
  tags:  string[];
}

interface Group {
  id:    string;
  name:  string;
  count: number;
}

interface AudienceSelectorProps {
  audienceType:      AudienceType;
  onTypeChange:      (type: AudienceType) => void;
  selectedTags:      string[];
  onTagsChange:      (tags: string[]) => void;
  selectedContacts:  string[];
  onContactsChange:  (contacts: string[]) => void;
  selectedGroup:     string;
  onGroupChange:     (groupId: string) => void;
  onGroupMemberCountChange?: (count: number) => void;
  csvContacts?:      any[];
  onCsvContactsChange?: (contacts: any[]) => void;
  availableTags:     string[];
  contacts:          Contact[];  // Loaded 100 contacts (fallback only)
  totalSelected:     number;
  allContactsCount?: number;
}

// ─── Component ────────────────────────────────────────────────
const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  audienceType,
  onTypeChange,
  selectedTags,
  onTagsChange,
  selectedContacts,
  onContactsChange,
  selectedGroup,
  onGroupChange,
  onGroupMemberCountChange,
  csvContacts = [],
  onCsvContactsChange,
  availableTags,
  contacts,
  totalSelected,
  allContactsCount,
}) => {
  const [searchQuery,     setSearchQuery]     = useState('');
  const [groups,          setGroups]          = useState<Group[]>([]);
  const [loadingGroups,   setLoadingGroups]    = useState(false);
  const [csvFileName,     setCsvFileName]      = useState('');

  // ✅ FIX 1: Total counts from backend
  const [totalAllCount,   setTotalAllCount]   = useState<number>(0);
  const [totalTagsCount,  setTotalTagsCount]  = useState<number>(0);
  const [loadingCounts,   setLoadingCounts]    = useState(false);

  // ✅ FIX 2: Backend search for manual selection
  const [searchResults,   setSearchResults]   = useState<Contact[]>([]);
  const [searchLoading,   setSearchLoading]    = useState(false);

  // ✅ Selected contacts details (to show names for selected)
  const [selectedContactsDetails, setSelectedContactsDetails] = useState<Contact[]>([]);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ─── Load groups on mount ─────────────────────────────────
  useEffect(() => {
    setLoadingGroups(true);
    api.get('/contacts/groups/all')
      .then(res => {
        const data = res.data?.data || [];
        setGroups(data.map((g: any) => ({
          id:    g.id,
          name:  g.name,
          count: g.contactCount || g._count?.members || 0,
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingGroups(false));
  }, []);

  // ─── FIX 1: Load total "All Contacts" count ───────────────
  useEffect(() => {
    setLoadingCounts(true);
    contactsApi.getAudienceCount({ type: 'all' })
      .then(res => {
        const count = res.data?.data?.count || 0;
        setTotalAllCount(count);
      })
      .catch(() => setTotalAllCount(0))
      .finally(() => setLoadingCounts(false));
  }, []);

  // ─── FIX 2: Update tags count when selection changes ──────
  useEffect(() => {
    if (selectedTags.length === 0) {
      setTotalTagsCount(0);
      return;
    }

    contactsApi.getAudienceCount({
      type: 'tags',
      tags: selectedTags.join(','),
    })
      .then(res => setTotalTagsCount(res.data?.data?.count || 0))
      .catch(() => setTotalTagsCount(0));
  }, [selectedTags]);

  // ─── FIX 3: Update group member count ─────────────────────
  useEffect(() => {
    if (!selectedGroup) {
      onGroupMemberCountChange?.(0);
      return;
    }

    const group = groups.find(g => g.id === selectedGroup);
    if (group) {
      // Use cached group count first (instant)
      onGroupMemberCountChange?.(group.count);
    }

    // Then fetch exact count from backend
    contactsApi.getAudienceCount({
      type:    'group',
      groupId: selectedGroup,
    })
      .then(res => {
        const count = res.data?.data?.count || 0;
        onGroupMemberCountChange?.(count);
      })
      .catch(() => {});
  }, [selectedGroup, groups, onGroupMemberCountChange]);

  // ─── FIX 4: Backend search for manual selection ───────────
  const performSearch = useCallback((query: string) => {
    setSearchLoading(true);
    contactsApi.search(query, 30)
      .then(res => {
        const results = res.data?.data?.contacts || [];
        setSearchResults(results);
      })
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  }, []);

  // Debounced search
  useEffect(() => {
    if (audienceType !== 'manual') return;

    clearTimeout(searchDebounce.current);

    // Always fetch (empty query = first 30 contacts)
    searchDebounce.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(searchDebounce.current);
  }, [searchQuery, audienceType, performSearch]);

  // ─── Fetch selected contact details ───────────────────────
  useEffect(() => {
    if (selectedContacts.length === 0) {
      setSelectedContactsDetails([]);
      return;
    }

    // Merge search results + local contacts to find details
    const allKnown = [...searchResults, ...contacts];
    const details = selectedContacts
      .map(id => allKnown.find(c => c.id === id))
      .filter(Boolean) as Contact[];

    // Keep unique
    const unique = Array.from(
      new Map(details.map(c => [c.id, c])).values()
    );
    setSelectedContactsDetails(unique);
  }, [selectedContacts, searchResults, contacts]);

  // ─── Audience type cards ──────────────────────────────────
  const audienceTypes = [
    {
      value:       'all' as AudienceType,
      label:       'All Contacts',
      description: 'Send to all your contacts',
      icon:        Users,
      count:       allContactsCount !== undefined
                     ? allContactsCount.toLocaleString()
                     : (loadingCounts ? '...' : totalAllCount.toLocaleString()),
    },
    {
      value:       'group' as AudienceType,
      label:       'By Group',
      description: 'Select a contact group',
      icon:        Layers,
      count:       groups.length,
    },
    {
      value:       'tags' as AudienceType,
      label:       'By Tags',
      description: 'Select contacts by tags',
      icon:        Tag,
      count:       null,
    },
    {
      value:       'manual' as AudienceType,
      label:       'Select Manually',
      description: 'Choose specific contacts',
      icon:        UserPlus,
      count:       null,
    },
    {
      value:       'csv' as AudienceType,
      label:       'Upload CSV',
      description: 'Upload custom contacts List',
      icon:        Users,
      count:       csvContacts?.length || 0,
    },
  ];

  const toggleTag = (tag: string) => {
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const toggleContact = (contactId: string) => {
    onContactsChange(
      selectedContacts.includes(contactId)
        ? selectedContacts.filter(c => c !== contactId)
        : [...selectedContacts, contactId]
    );
  };

  const selectAllVisibleContacts = () => {
    const visibleIds = searchResults.map(c => c.id);
    const allSelected = visibleIds.every(id => selectedContacts.includes(id));

    if (allSelected) {
      // Deselect visible
      onContactsChange(
        selectedContacts.filter(id => !visibleIds.includes(id))
      );
    } else {
      // Add all visible to selection
      const merged = Array.from(new Set([...selectedContacts, ...visibleIds]));
      onContactsChange(merged);
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Audience Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {audienceTypes.map(type => {
          const isSelected = audienceType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all
                          ${isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 hover:bg-emerald-50/50'}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center
                                 justify-center shrink-0
                                 ${isSelected
                                   ? 'bg-emerald-100 dark:bg-emerald-500/20'
                                   : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <type.icon className={`w-5 h-5 ${
                    isSelected
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-semibold ${
                      isSelected
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {type.label}
                    </h4>
                    {type.count !== null && (
                      <span className={`text-sm font-medium ${
                        isSelected
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {type.count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Group Selection */}
      {audienceType === 'group' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4
                        border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Select Group
            </h4>
            {loadingGroups && (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            )}
          </div>

          <select
            value={selectedGroup}
            onChange={e => onGroupChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300
                       dark:border-gray-600 rounded-lg focus:ring-2
                       focus:ring-emerald-500 bg-white dark:bg-gray-900
                       text-gray-900 dark:text-white transition-all"
          >
            <option value="">-- Select a Group --</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.count.toLocaleString()} contacts)
              </option>
            ))}
          </select>

          {selectedGroup && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400
                          flex items-center gap-1">
              <Check className="w-4 h-4" />
              Group selected
            </p>
          )}

          {groups.length === 0 && !loadingGroups && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No groups found. Create groups in Contacts section first.
            </p>
          )}
        </div>
      )}

      {/* Tags Selection */}
      {audienceType === 'tags' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200
                        dark:border-gray-700 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Select Tags
            </h4>
            {/* ✅ FIX 2: Real count from backend */}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalTagsCount.toLocaleString()} contacts matching
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium
                            transition-all
                            ${selectedTags.includes(tag)
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-emerald-400 hover:bg-emerald-50'}`}
              >
                {selectedTags.includes(tag) && (
                  <Check className="w-3 h-3 inline mr-1" />
                )}
                {tag}
              </button>
            ))}
          </div>
          {availableTags.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No tags available
            </p>
          )}
        </div>
      )}

      {/* ✅ FIX 4: Manual Selection - Backend Search */}
      {audienceType === 'manual' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200
                        dark:border-gray-700 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Select Contacts
            </h4>
            {searchResults.length > 0 && (
              <button
                onClick={selectAllVisibleContacts}
                className="text-sm text-emerald-600 dark:text-emerald-400
                           hover:text-emerald-700 dark:hover:text-emerald-300
                           font-medium transition-colors"
              >
                {searchResults.every(c => selectedContacts.includes(c.id))
                  ? 'Deselect Visible'
                  : 'Select Visible'}
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2
                               w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-900
                         border border-gray-300 dark:border-gray-600
                         rounded-xl focus:outline-none focus:ring-2
                         focus:ring-emerald-500 text-gray-900 dark:text-white
                         placeholder-gray-400 transition-all"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2
                                  w-4 h-4 animate-spin text-emerald-500" />
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {searchLoading && searchResults.length === 0 ? (
              <div className="text-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
                {searchQuery
                  ? 'No contacts found matching your search'
                  : 'Start typing to search contacts...'}
              </p>
            ) : (
              searchResults.map(contact => (
                <label
                  key={contact.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg
                              cursor-pointer transition-all
                              ${selectedContacts.includes(contact.id)
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/40'
                                : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-emerald-50/50 hover:border-emerald-300'}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                    className="w-4 h-4 text-emerald-500 border-gray-300
                               rounded focus:ring-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {contact.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.phone}
                    </p>
                  </div>
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {contact.tags.slice(0, 2).map(tag => (
                        <span key={tag}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700
                                         text-gray-600 dark:text-gray-300
                                         rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </label>
              ))
            )}
          </div>

          {/* ✅ Selection info */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {selectedContacts.length > 0 ? (
                <>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedContacts.length.toLocaleString()}
                  </span>
                  {' '}contacts selected from{' '}
                  <span className="font-semibold">
                    {totalAllCount.toLocaleString()}
                  </span>
                  {' '}total
                </>
              ) : (
                <>
                  Search from{' '}
                  <span className="font-semibold">
                    {totalAllCount.toLocaleString()}
                  </span>
                  {' '}contacts
                </>
              )}
            </p>
          </div>

          {/* ✅ Selected contacts pills (if any) */}
          {selectedContactsDetails.length > 0 && selectedContacts.length <= 20 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Selected:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedContactsDetails.map(c => (
                  <span key={c.id}
                        className="inline-flex items-center gap-1 px-2 py-1
                                   bg-emerald-100 dark:bg-emerald-500/20
                                   text-emerald-700 dark:text-emerald-300
                                   rounded-full text-xs font-medium">
                    {c.name}
                    <button
                      onClick={() => toggleContact(c.id)}
                      className="hover:bg-emerald-200 dark:hover:bg-emerald-500/30
                                 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSV Selection */}
      {audienceType === 'csv' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4
                        border-2 border-dashed border-gray-300 dark:border-gray-600
                        text-center">
          <input
            type="file"
            accept=".csv"
            id="csv-upload"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = event => {
                try {
                  const text = event.target?.result as string;
                  const rows = text.split('\n')
                    .map(r => r.trim())
                    .filter(Boolean);

                  if (rows.length < 2) {
                    alert('CSV must have headers and data');
                    return;
                  }

                  const headers = rows[0].split(',').map(h => h.trim());
                  const parsed  = rows.slice(1).map(row => {
                    const values = row.split(',').map(v => v.trim());
                    const obj: any = {};
                    headers.forEach((h, i) => {
                      obj[h] = values[i] || '';
                    });
                    return obj;
                  });

                  const formatted = parsed
                    .map(p => ({
                      phone: p['Phone']  || p['phone'] ||
                             p['Number'] || p['number'],
                      customData: p,
                    }))
                    .filter(p => p.phone);

                  onCsvContactsChange?.(formatted);
                  setCsvFileName(file.name);
                } catch {
                  alert('Failed to parse CSV');
                }
              };
              reader.readAsText(file);
            }}
          />

          {csvContacts && csvContacts.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100
                              dark:bg-emerald-500/20 flex items-center
                              justify-center mb-1">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {csvFileName || 'Uploaded CSV'}
                </h4>
                <p className="text-sm text-emerald-600 dark:text-emerald-400
                              font-medium">
                  {csvContacts.length.toLocaleString()} recipients loaded
                </p>
              </div>
              <button
                onClick={() => {
                  onCsvContactsChange?.([]);
                  setCsvFileName('');
                  const el = document.getElementById('csv-upload') as HTMLInputElement;
                  if (el) el.value = '';
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 text-sm
                           font-medium text-red-600 bg-red-50
                           hover:bg-red-100 rounded-lg transition-colors
                           border border-red-200"
              >
                <X className="w-4 h-4" />
                Remove CSV
              </button>
            </div>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-gray-100
                              dark:bg-gray-700 flex items-center
                              justify-center mx-auto">
                <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Upload Contacts CSV
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ensure your CSV has a column named "Phone" or "Number".
              </p>
              <label
                htmlFor="csv-upload"
                className="inline-block mt-2 px-5 py-2.5 bg-emerald-500
                           hover:bg-emerald-600 text-white rounded-lg
                           cursor-pointer font-medium transition-all shadow-sm"
              >
                Choose CSV File
              </label>
            </>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="bg-emerald-50 dark:bg-emerald-500/10 border
                      border-emerald-200 dark:border-emerald-500/30
                      rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Total Recipients
            </span>
          </div>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalSelected.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudienceSelector;