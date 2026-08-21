// src/components/campaigns/TemplateSelector.tsx
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
  headerVariables?: string[];
  status: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedId: string;
  onSelect: (template: Template) => void;
  onPreview: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  marketing: 'bg-purple-100 text-purple-800 border-purple-200',
  utility: 'bg-blue-100 text-blue-800 border-blue-200',
  authentication: 'bg-orange-100 text-orange-800 border-orange-200',
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

  const getHeaderIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'image': return Image;
      case 'video': return Video;
      case 'document': return File;
      case 'text': return FileText;
      default: return null;
    }
  };

  const getHeaderBadgeColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'image': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'video': return 'bg-red-100 text-red-800 border-red-200';
      case 'document': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'text': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return '';
    }
  };

  const truncateBody = (text: string, maxLength = 110): string => {
    const safe = safeBody(text);
    return safe.length <= maxLength
      ? safe
      : safe.substring(0, maxLength) + '...';
  };

  const getTotalVarCount = (t: Template): number =>
    (t.variables?.length || 0) + (t.headerVariables?.length || 0);

  return (
    <div className="space-y-4">
      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates by name or text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 font-semibold text-xs transition-all placeholder:text-gray-400"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold text-xs transition-all"
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

      <p className="text-xs font-bold text-gray-400 px-1">
        {filteredTemplates.length} approved template{filteredTemplates.length !== 1 ? 's' : ''} available
      </p>

      {/* ── Template Cards List ── */}
      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
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
              className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none ${isSelected
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/10'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50/80 bg-white shadow-sm'
                }`}
            >
              {isSelected && (
                <div className="absolute top-3.5 right-12">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              )}

              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                  }`}>
                  {HeaderIcon ? <HeaderIcon className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={`font-bold text-sm truncate max-w-[200px] ${isSelected ? 'text-emerald-950' : 'text-gray-900'
                      }`}>
                      {template.name}
                    </h4>

                    {hasMedia && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${getHeaderBadgeColor(template.headerType)}`}>
                        {template.headerType}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-2.5 line-clamp-2 leading-relaxed font-normal">
                    {truncateBody(template.body)}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${CATEGORY_COLORS[template.category] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                      <Tag className="w-2.5 h-2.5" />
                      {template.category}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold border border-gray-200">
                      <Globe className="w-2.5 h-2.5" />
                      {template.language}
                    </span>

                    {totalVars > 0 && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full text-[10px] font-bold">
                        {totalVars} var{totalVars !== 1 ? 's' : ''}
                      </span>
                    )}

                    {template.buttons?.length > 0 && (
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 rounded-full text-[10px] font-bold">
                        {template.buttons.length} btn{template.buttons.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onSelect(template);
                    onPreview();
                  }}
                  className="p-2 hover:bg-white rounded-xl transition-all shrink-0 border border-transparent hover:border-gray-200 hover:shadow-sm"
                  title="Preview Template"
                >
                  <Eye className="w-4 h-4 text-gray-400 hover:text-gray-700" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-700 font-bold text-sm">No templates found</p>
            <p className="text-gray-400 text-xs font-semibold mt-1">
              {searchQuery ? 'Try a different search query' : 'No approved templates available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;