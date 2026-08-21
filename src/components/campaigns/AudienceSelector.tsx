// src/components/campaigns/AudienceSelector.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users, Tag, UserPlus, Search, Check, Layers,
  Loader2, FileText, X,
} from 'lucide-react';
import { contacts as contactsApi } from '../../services/api';
import api from '../../services/api';

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
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedContacts: string[];
  onContactsChange: (contacts: string[]) => void;
  selectedGroup: string;
  onGroupChange: (groupId: string) => void;
  onGroupMemberCountChange?: (count: number) => void;
  csvContacts?: any[];
  onCsvContactsChange?: (contacts: any[]) => void;
  availableTags: string[];
  contacts: Contact[];
  totalSelected: number;
  allContactsCount?: number;
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
  onGroupMemberCountChange,
  csvContacts = [],
  onCsvContactsChange,
  availableTags,
  contacts,
  totalSelected,
  allContactsCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');

  const [totalAllCount, setTotalAllCount] = useState<number>(0);
  const [totalTagsCount, setTotalTagsCount] = useState<number>(0);
  const [loadingCounts, setLoadingCounts] = useState(false);

  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedContactsDetails, setSelectedContactsDetails] = useState<Contact[]>([]);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLoadingGroups(true);
    api.get('/contacts/groups/all')
      .then(res => {
        const data = res.data?.data || [];
        setGroups(data.map((g: any) => ({
          id: g.id,
          name: g.name,
          count: g.contactCount || g._count?.members || 0,
        })));
      })
      .catch(() => { })
      .finally(() => setLoadingGroups(false));
  }, []);

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

  useEffect(() => {
    if (!selectedGroup) {
      onGroupMemberCountChange?.(0);
      return;
    }

    const group = groups.find(g => g.id === selectedGroup);
    if (group) {
      onGroupMemberCountChange?.(group.count);
    }

    contactsApi.getAudienceCount({
      type: 'group',
      groupId: selectedGroup,
    })
      .then(res => {
        const count = res.data?.data?.count || 0;
        onGroupMemberCountChange?.(count);
      })
      .catch(() => { });
  }, [selectedGroup, groups, onGroupMemberCountChange]);

  const performSearch = useCallback((query: string) => {
    setSearchLoading(true);
    contactsApi.search(query, 30)
      .then(res => {
        const results = (res.data?.data?.contacts || []).map((c: any) => ({
          id: c.id,
          name: c.name || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.phone || 'Unknown',
          phone: c.phone || '',
          tags: Array.isArray(c.tags) ? c.tags : [],
        }));
        setSearchResults(results);
      })
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  }, []);

  useEffect(() => {
    if (audienceType !== 'manual') return;

    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(searchDebounce.current);
  }, [searchQuery, audienceType, performSearch]);

  useEffect(() => {
    if (selectedContacts.length === 0) {
      setSelectedContactsDetails([]);
      return;
    }

    const allKnown = [...searchResults, ...contacts];
    const details = selectedContacts
      .map(id => allKnown.find(c => c.id === id))
      .filter(Boolean) as Contact[];

    const unique = Array.from(
      new Map(details.map(c => [c.id, c])).values()
    );
    setSelectedContactsDetails(unique);
  }, [selectedContacts, searchResults, contacts]);

  const audienceTypes = [
    {
      value: 'all' as AudienceType,
      label: 'All Contacts',
      description: 'Send to all your contacts in database',
      icon: Users,
      count: allContactsCount !== undefined
        ? allContactsCount.toLocaleString()
        : (loadingCounts ? '...' : totalAllCount.toLocaleString()),
    },
    {
      value: 'group' as AudienceType,
      label: 'By Group',
      description: 'Select a saved contact group',
      icon: Layers,
      count: groups.length,
    },
    {
      value: 'tags' as AudienceType,
      label: 'By Tags',
      description: 'Filter contacts using tags',
      icon: Tag,
      count: null,
    },
    {
      value: 'manual' as AudienceType,
      label: 'Select Manually',
      description: 'Pick specific contacts from list',
      icon: UserPlus,
      count: null,
    },
    {
      value: 'csv' as AudienceType,
      label: 'Upload CSV',
      description: 'Import custom spreadsheet list',
      icon: FileText,
      count: csvContacts?.length || 0,
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
      onContactsChange(selectedContacts.filter(id => !visibleIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedContacts, ...visibleIds]));
      onContactsChange(merged);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Audience Type Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {audienceTypes.map(type => {
          const isSelected = audienceType === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onTypeChange(type.value)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 select-none relative overflow-hidden ${isSelected
                  ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/10'
                  : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 shadow-sm'
                }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                  }`}>
                  <type.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-bold text-sm ${isSelected ? 'text-emerald-950' : 'text-gray-900'}`}>
                      {type.label}
                    </h4>
                    {type.count !== null && (
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-200/60 text-emerald-900' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {type.count}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 font-medium ${isSelected ? 'text-emerald-800/80' : 'text-gray-500'}`}>
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Group Selection ── */}
      {audienceType === 'group' && (
        <div className="bg-white rounded-2xl p-5 space-y-4 border border-gray-200 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900">Select Contact Group</h4>
            {loadingGroups && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
          </div>

          <select
            value={selectedGroup}
            onChange={e => onGroupChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50 text-gray-900 font-semibold text-sm transition-all"
          >
            <option value="">-- Choose a Saved Group --</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.count.toLocaleString()} contacts)
              </option>
            ))}
          </select>

          {selectedGroup && (
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <Check className="w-4 h-4 text-emerald-600" /> Group selected successfully
            </p>
          )}

          {groups.length === 0 && !loadingGroups && (
            <p className="text-xs font-semibold text-gray-500">
              No groups found. Create groups in Contacts section first.
            </p>
          )}
        </div>
      )}

      {/* ── Tags Selection ── */}
      {audienceType === 'tags' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900">Select Audience Tags</h4>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {totalTagsCount.toLocaleString()} contacts matching
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => {
              const isTagSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isTagSelected
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                >
                  {isTagSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  #{tag}
                </button>
              );
            })}
          </div>

          {availableTags.length === 0 && (
            <p className="text-center text-xs font-semibold text-gray-400 py-4">
              No audience tags found in your contact list
            </p>
          )}
        </div>
      )}

      {/* ── Manual Selection ── */}
      {audienceType === 'manual' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900">Select Specific Contacts</h4>
            {searchResults.length > 0 && (
              <button
                type="button"
                onClick={selectAllVisibleContacts}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-extrabold transition-colors"
              >
                {searchResults.every(c => selectedContacts.includes(c.id))
                  ? 'Deselect Visible'
                  : 'Select All Visible'}
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone number, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 text-xs font-semibold placeholder-gray-400 transition-all"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-emerald-600" />
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {searchLoading && searchResults.length === 0 ? (
              <div className="text-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                <p className="text-xs font-semibold text-gray-500 mt-2">Searching contacts...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-xs font-semibold">
                {searchQuery ? 'No contacts found matching your query' : 'Start typing to search contacts'}
              </p>
            ) : (
              searchResults.map(contact => {
                const isChecked = selectedContacts.includes(contact.id);
                return (
                  <label
                    key={contact.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all border ${isChecked
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-gray-50/60 border-gray-200 hover:bg-gray-50 text-gray-800'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleContact(contact.id)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">{contact.name}</p>
                      <p className="text-[11px] font-mono font-medium text-gray-500">{contact.phone}</p>
                    </div>
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex space-x-1">
                        {contact.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-200/60 text-gray-700 rounded-md text-[10px] font-bold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </label>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 text-center">
              {selectedContacts.length > 0 ? (
                <>
                  <span className="font-extrabold text-emerald-700">{selectedContacts.length.toLocaleString()}</span> contacts selected from <span className="font-extrabold text-gray-900">{totalAllCount.toLocaleString()}</span> total
                </>
              ) : (
                <>Search across <span className="font-extrabold text-gray-900">{totalAllCount.toLocaleString()}</span> total contacts</>
              )}
            </p>
          </div>

          {selectedContactsDetails.length > 0 && selectedContacts.length <= 20 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Selected Contacts:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedContactsDetails.map(c => (
                  <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold border border-emerald-200">
                    {c.name}
                    <button type="button" onClick={() => toggleContact(c.id)} className="hover:bg-emerald-200/80 rounded-md p-0.5 transition-colors">
                      <X className="w-3 h-3 text-emerald-800" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CSV Upload Option ── */}
      {audienceType === 'csv' && (
        <div className="bg-white rounded-2xl p-6 space-y-4 border-2 border-dashed border-gray-200 text-center animate-in fade-in duration-200">
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
                  const rows = text.split('\n').map(r => r.trim()).filter(Boolean);

                  if (rows.length < 2) {
                    alert('CSV must contain headers and data rows.');
                    return;
                  }

                  const headers = rows[0].split(',').map(h => h.trim());
                  const parsed = rows.slice(1).map(row => {
                    const values = row.split(',').map(v => v.trim());
                    const obj: any = {};
                    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
                    return obj;
                  });

                  const formatted = parsed
                    .map(p => ({
                      phone: p['Phone'] || p['phone'] || p['Number'] || p['number'],
                      customData: p,
                    }))
                    .filter(p => p.phone);

                  onCsvContactsChange?.(formatted);
                  setCsvFileName(file.name);
                } catch {
                  alert('Failed to parse CSV file.');
                }
              };
              reader.readAsText(file);
            }}
          />

          {csvContacts && csvContacts.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-1 text-emerald-700">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">{csvFileName || 'Uploaded CSV File'}</h4>
                <p className="text-xs text-emerald-700 font-extrabold mt-0.5">
                  {csvContacts.length.toLocaleString()} recipients successfully loaded
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onCsvContactsChange?.([]);
                  setCsvFileName('');
                  const el = document.getElementById('csv-upload') as HTMLInputElement;
                  if (el) el.value = '';
                }}
                className="mt-2 flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
              >
                <X className="w-4 h-4" /> Remove CSV
              </button>
            </div>
          ) : (
            <>
              <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-500">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-gray-900">Upload Contacts CSV Spreadsheet</h4>
              <p className="text-xs text-gray-500 font-medium">Ensure your CSV contains a "Phone" or "Number" header column.</p>
              <label
                htmlFor="csv-upload"
                className="inline-block mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Choose CSV File
              </label>
            </>
          )}
        </div>
      )}

      {/* ── High-Contrast Total Recipients Card ── */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-white block">Total Audience Size</span>
            <span className="text-xs text-emerald-100 font-medium">Confirmed broadcast targets</span>
          </div>
        </div>
        <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
          {totalSelected.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default AudienceSelector;