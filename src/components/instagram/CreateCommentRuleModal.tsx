import React, { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

const CreateCommentRuleModal = ({ isOpen, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    commentReply: '',
    dmMessage: '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0e27] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">New Comment Rule</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Rule Name</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#e1306c]"
              placeholder="e.g. Summer Sale Auto-reply"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Keywords (Comma separated)</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#e1306c]"
              placeholder="price, info, interested"
              onChange={(e) => setFormData({...formData, keywords: e.target.value})}
            />
            <p className="text-[10px] text-gray-500 mt-1">Leave empty to reply to every comment.</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                <Send size={14} className="text-[#833ab4]" /> Public Comment Reply
              </label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none h-20"
                placeholder="Thanks! Check your DM for details."
                onChange={(e) => setFormData({...formData, commentReply: e.target.value})}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                <MessageCircle size={14} className="text-[#e1306c]" /> Private DM Message
              </label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none h-20"
                placeholder="Hi! Here is the pricing information you requested..."
                onChange={(e) => setFormData({...formData, dmMessage: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-bold">Cancel</button>
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d)' }}
          >
            Create Rule
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommentRuleModal;
