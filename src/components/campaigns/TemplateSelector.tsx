import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  MessageSquare,
  Image,
  Video,
  File,
  FileText,
  Eye
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  headerType: string;
  body: string;
  buttons: { text: string }[];
  variables: string[];
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedId: string;
  onSelect: (template: Template) => void;
  onPreview: (template: Template) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedId,
  onSelect,
  onPreview
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', 'marketing', 'utility', 'authentication'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getHeaderIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'document': return File;
      default: return FileText;
    }
  };

  const truncateBody = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-3 max-h-100 overflow-y-auto pr-2">
        {filteredTemplates.map((template) => {
          const HeaderIcon = getHeaderIcon(template.headerType);
          const isSelected = selectedId === template.id;

          return (
            <div
              key={template.id}
              onClick={() => onSelect(template)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/[0.02] shadow-[inset_0_0_0_1px_rgba(16,185,129,0.4)]'
                  : 'border-white/[0.05] hover:bg-emerald-500/[0.02] hover:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.4)] bg-white/[0.02]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-emerald-500/20' : 'bg-white/[0.04]'
                }`}>
                  <MessageSquare className={`w-5 h-5 ${
                    isSelected ? 'text-emerald-500' : 'text-gray-500'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-white">{template.name}</h4>
                    {template.headerType !== 'none' && (
                      <HeaderIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {truncateBody(template.body)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-white/[0.04] text-gray-400 rounded text-xs capitalize border border-white/[0.05]">
                      {template.category}
                    </span>
                    <span className="px-2 py-0.5 bg-white/[0.04] text-gray-400 rounded text-xs border border-white/[0.05]">
                      {template.language}
                    </span>
                    {template.variables.length > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-xs">
                        {template.variables.length} variables
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(template);
                  }}
                  className="p-2 hover:bg-white/[0.04] rounded-lg transition-all"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No templates found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;