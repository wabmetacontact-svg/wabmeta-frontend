// src/components/common/ConnectWhatsAppChoice.tsx
//
// Meta opens a different Embedded Signup flow depending on whether the number
// already runs the WhatsApp Business app, and nothing in the API tells us which
// case it is - the business has to say. This modal asks, and is shared by every
// place that starts a connection so the wording and the caveats stay identical.

import React from 'react';
import {
  X,
  Smartphone,
  Sparkles,
  ArrowRight,
  Gauge,
  CalendarClock,
  MessagesSquare,
} from 'lucide-react';
import type { ConnectMode } from '../../hooks/useMetaConnect';

interface ConnectWhatsAppChoiceProps {
  open: boolean;
  onCancel: () => void;
  onChoose: (mode: ConnectMode) => void;
}

export const ConnectWhatsAppChoice: React.FC<ConnectWhatsAppChoiceProps> = ({
  open,
  onCancel,
  onChoose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    p-6 sm:p-10 bg-slate-900/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg
                   max-h-full overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-choice-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div>
            <h2
              id="connect-choice-title"
              className="text-xl font-bold text-slate-900"
            >
              Connect WhatsApp
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Does this number already use WhatsApp?
            </p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="p-1.5 -m-1.5 rounded-lg text-slate-400
                       hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="px-5 space-y-2.5">
          {/* Coexistence */}
          <button
            onClick={() => onChoose('existing')}
            className="group w-full text-left rounded-xl border border-slate-200
                       p-4 transition-all
                       hover:border-emerald-500 hover:shadow-md
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex-shrink-0
                              flex items-center justify-center
                              group-hover:bg-emerald-100 transition-colors">
                <Smartphone className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">
                    Yes, it runs WhatsApp Business
                  </p>
                  <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0
                                         group-hover:text-emerald-500
                                         group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Keep the app on your phone. WabMeta sends and receives on the
                  same number, and your chats stay where they are.
                </p>

                <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5">
                  <Caveat icon={Gauge}>
                    Sending capped at <strong>20 messages/second</strong> — large
                    campaigns run slower
                  </Caveat>
                  <Caveat icon={CalendarClock}>
                    Open the app at least once every <strong>13 days</strong>, or
                    the number is deactivated
                  </Caveat>
                  <Caveat icon={MessagesSquare}>
                    Existing chats stay in the app — only new messages reach your
                    WabMeta inbox
                  </Caveat>
                </div>
              </div>
            </div>
          </button>

          {/* Fresh number */}
          <button
            onClick={() => onChoose('new')}
            className="group w-full text-left rounded-xl border border-slate-200
                       p-4 transition-all
                       hover:border-emerald-500 hover:shadow-md
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex-shrink-0
                              flex items-center justify-center
                              group-hover:bg-sky-100 transition-colors">
                <Sparkles className="w-5 h-5 text-sky-600" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">
                    No, this number is free
                  </p>
                  <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0
                                         group-hover:text-emerald-500
                                         group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  A new number, or one where you have already deleted the
                  WhatsApp account. Full sending speed, everything in WabMeta.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 pt-3 pb-5">
          <p className="text-xs text-slate-400 text-center">
            Not sure? Open WhatsApp on the phone that holds this number — if it
            signs in, choose the first option.
          </p>
        </div>
      </div>
    </div>
  );
};

const Caveat: React.FC<{
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
    <span className="text-xs text-slate-500 leading-relaxed">{children}</span>
  </div>
);

export default ConnectWhatsAppChoice;
