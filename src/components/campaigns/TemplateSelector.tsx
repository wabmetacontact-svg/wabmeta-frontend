// src/components/campaigns/TemplateSelector.tsx - FINAL FIX
// ✅ FIX 1: onPreview prop mismatch fix (parent sirf () => void deta hai)
// ✅ FIX 2: headerVariables count bhi dikhao variables badge mein
// ✅ FIX 3: Media type icon aur badge properly dikhao
// ✅ FIX 4: Empty body text crash fix

import React, { useState, useMemo } from 'react';
import {
  Search, CheckCircle2, MessageSquare,
  Image, Video, File, FileText, Eye,
  Tag, Globe,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  headerType: string;
  headerContent?: string;
  body: string;
  buttons: { text: string; type?: string }[];
  variables: string[];
  headerVariables?: string[]; // ✅ FIX 2
  status: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedId: string;
  onSelect: (template: Template) => void;
  onPreview: () => void; // ✅ FIX 1: Parent () => void deta hai
}

const CATEGORY_COLORS: Record<string, string> = {
  marketing: 'bg-purple-100 text-purple-700 border-purple-200',
  utility: 'bg-blue-100 text-blue-700 border-blue-200',
  authentication: 'bg-orange-100 text-orange-700 border-orange-200',
};

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedId,
  onSelect,
  onPreview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', 'marketing', 'utility', 'authentication'];

  // ✅ FIX 4: Safe body text
  const safeBody = (text: any): string => String(text || '');

  const filteredTemplates = useMemo(() =>
    templates.filter(t => {
      const body = safeBody(t.body);
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        body.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }),
    [templates, searchQuery, categoryFilter]
  );

  // ✅ FIX 3: Proper header icon
  const getHeaderIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'image':    return Image;
      case 'video':    return Video;
      case 'document': return File;
      case 'text':     return FileText;
      default:         return null;
    }
  };

  const getHeaderBadgeColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'image':    return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'video':    return 'bg-red-100 text-red-700 border-red-200';
      case 'document': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'text':     return 'bg-gray-100 text-gray-700 border-gray-200';
      default:         return '';
    }
  };

  const truncateBody = (text: string, maxLength = 100): string => {
    const safe = safeBody(text);
    return safe.length <= maxLength
      ? safe
      : safe.substring(0, maxLength) + '...';
  };

  // ✅ FIX 2: Total variable count (body + header)
  const getTotalVarCount = (t: Template): number =>
    (t.variables?.length || 0) + (t.headerVariables?.length || 0);

  return (
    <div className="space-y-4">

      {/* ── Search & Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200
                       rounded-xl focus:outline-none focus:ring-2
                       focus:ring-emerald-500 focus:border-emerald-500
                       text-gray-900 placeholder:text-gray-400 text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-emerald-500
                     text-gray-900 text-sm"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all'
                ? 'All Categories'
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* ── Count ── */}
      <p className="text-xs text-gray-500 px-1">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
      </p>

      {/* ── Templates List ── */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {filteredTemplates.map(template => {
          const HeaderIcon = getHeaderIcon(template.headerType);
          const isSelected = selectedId === template.id;
          const totalVars = getTotalVarCount(template);
          const headerType = template.headerType?.toLowerCase();
          const hasMedia = ['image', 'video', 'document'].includes(headerType);

          return (
            <div
              key={template.id}
              onClick={() => onSelect(template)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer
                          transition-all duration-150
                          ${isSelected
                ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 bg-white'}`}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center
                                 justify-center shrink-0
                                 ${isSelected
                    ? 'bg-emerald-100'
                    : 'bg-gray-100'}`}>
                  {HeaderIcon
                    ? <HeaderIcon className={`w-5 h-5 ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`} />
                    : <MessageSquare className={`w-5 h-5 ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`} />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={`font-semibold text-sm truncate max-w-[180px]
                                    ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {template.name}
                    </h4>

                    {/* ✅ FIX 3: Media type badge */}
                    {hasMedia && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px]
                                        font-semibold border uppercase
                                        ${getHeaderBadgeColor(template.headerType)}`}>
                        {template.headerType}
                      </span>
                    )}
                  </div>

                  {/* Body preview */}
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                    {truncateBody(template.body)}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Category */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5
                                      rounded-full text-[10px] font-semibold
                                      border capitalize
                                      ${CATEGORY_COLORS[template.category] ||
                        'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      <Tag className="w-2.5 h-2.5" />
                      {template.category}
                    </span>

                    {/* Language */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5
                                     bg-gray-100 text-gray-600 rounded-full
                                     text-[10px] border border-gray-200">
                      <Globe className="w-2.5 h-2.5" />
                      {template.language}
                    </span>

                    {/* Variables badge */}
                    {totalVars > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700
                                       border border-emerald-200 rounded-full
                                       text-[10px] font-semibold">
                        {totalVars} var{totalVars !== 1 ? 's' : ''}
                      </span>
                    )}

                    {/* Buttons badge */}
                    {template.buttons?.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700
                                       border border-blue-200 rounded-full
                                       text-[10px] font-semibold">
                        {template.buttons.length} btn{template.buttons.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onSelect(template); // ✅ Select first
                    onPreview();        // ✅ Then preview
                  }}
                  className="p-2 hover:bg-white rounded-lg transition-all
                             shrink-0 border border-transparent
                             hover:border-gray-200 hover:shadow-sm"
                  title="Preview template"
                >
                  <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl
                          border-2 border-dashed border-gray-200">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No templates found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? 'Try a different search term'
                : 'No approved templates available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;