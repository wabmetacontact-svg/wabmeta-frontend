// src/components/common/ConnectWhatsAppChoice.tsx
//
// Meta opens a different Embedded Signup flow depending on whether the number
// already runs the WhatsApp Business app, and nothing in the API tells us which
// case it is - the business has to say. This modal asks, and is shared by every
// place that starts a connection so the wording and the caveats stay identical.

import React from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Connect WhatsApp</h2>
        <p className="text-gray-600 mb-6">
          Does the number you want to connect already use WhatsApp?
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onChoose('existing')}
            className="w-full text-left border border-gray-200 rounded-xl p-4
              hover:border-green-500 hover:bg-green-50/50 transition-colors"
          >
            <p className="font-semibold text-gray-900 mb-1">
              Yes, it already runs WhatsApp Business
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Keep using the WhatsApp Business app on your phone while WabMeta
              sends and receives on the same number. Your chats stay where they
              are.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-900 mb-1">
                Worth knowing before you choose this
              </p>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                <li>
                  Sending is capped at 20 messages per second, so large campaigns
                  run slower
                </li>
                <li>
                  Open the WhatsApp Business app at least once every 13 days or
                  the number is deactivated
                </li>
                <li>
                  Existing chats stay in the app - only messages from now on
                  appear in your WabMeta inbox
                </li>
              </ul>
            </div>
          </button>

          <button
            onClick={() => onChoose('new')}
            className="w-full text-left border border-gray-200 rounded-xl p-4
              hover:border-green-500 hover:bg-green-50/50 transition-colors"
          >
            <p className="font-semibold text-gray-900 mb-1">
              No, this number has no WhatsApp on it
            </p>
            <p className="text-sm text-gray-600">
              A fresh number, or one where you have already deleted the WhatsApp
              account. Full sending speed, and everything lives in WabMeta.
            </p>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="mt-5 w-full px-4 py-2.5 text-gray-600 font-medium
            hover:bg-gray-50 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConnectWhatsAppChoice;
