// src/pages/instagram/InstagramSettings.tsx
// Instagram connection status. Everything shown here comes from the real
// /instagram/accounts record — nothing is simulated.

import React, { useCallback, useEffect, useState } from 'react';
import {
  Instagram, Link as LinkIcon, RefreshCw, Trash2,
  CheckCircle, AlertCircle, Shield, ExternalLink, CheckSquare, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useInstagramConnect } from '../../hooks/useInstagramConnect';
import { instagram } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { ChannelHeader, GlassCard, INSTAGRAM_THEME as TH } from '../../components/channel/channelUi';

interface IgAccount {
  id: string;
  igUserId: string;
  username: string | null;
  name: string | null;
  profilePicUrl: string | null;
  status: string;
  isActive: boolean;
  lastSyncedAt?: string | null;
  _count?: { dmAutomations: number; commentRules: number };
}

const InstagramSettings: React.FC = () => {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<IgAccount[]>([]);
  const { connectInstagram, isConnecting } = useInstagramConnect();

  const load = useCallback(async () => {
    try {
      const res = await instagram.getAccounts();
      setAccounts(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDisconnect = async (account: IgAccount) => {
    const ok = await confirm({
      title: `Disconnect @${account.username || 'this account'}?`,
      message: 'Comment, DM and story automations will stop for this account. Existing conversations are kept.',
      confirmLabel: 'Disconnect',
      tone: 'danger',
    });
    if (!ok) return;

    const previous = accounts;
    setAccounts((prev) => prev.filter((a) => a.id !== account.id));
    try {
      await instagram.disconnectAccount(account.id);
      toast.success('Instagram account disconnected');
      await load();
    } catch (err: any) {
      setAccounts(previous);
      toast.error(err?.response?.data?.message || 'Could not disconnect that account.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  const connected = accounts.filter((a) => a.isActive);
  const isConnected = connected.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ChannelHeader
        theme={TH}
        icon={Instagram}
        title="Instagram Connection"
        subtitle="Manage the Instagram Business accounts linked to WabMeta and the permissions they granted."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        <div className="md:col-span-2 space-y-6">
          <div className="relative rounded-2xl bg-white border border-gray-200 shadow-sm p-6 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
              <Instagram size={140} />
            </div>

            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isConnected ? 'bg-emerald-50 border border-emerald-200' : 'bg-pink-50 border border-pink-200'}`}>
                  <Instagram className={isConnected ? 'text-emerald-500 w-6 h-6' : 'text-pink-500 w-6 h-6'} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Instagram Professional API</h3>
                  <p className="text-xs text-gray-500">Receive comments and Direct Messages in your unified inbox</p>
                </div>
              </div>

              {!isConnected ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Connect a professional Instagram account. It must be linked to a Facebook Page you administer.
                  </p>
                  <button
                    disabled={isConnecting}
                    onClick={connectInstagram}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-xl font-bold text-xs text-white shadow-md hover:scale-[1.01] transition-transform disabled:opacity-50"
                  >
                    {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                    {isConnecting ? 'Redirecting to Meta...' : 'Connect Instagram Account'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {connected.map((account) => (
                    <div key={account.id} className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {account.profilePicUrl ? (
                          <img src={account.profilePicUrl} alt={account.username || 'account'} className="w-10 h-10 rounded-full object-cover border border-emerald-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                            {(account.username || 'IG').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {account.name || account.username || 'Instagram account'}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            @{account.username || account.igUserId}
                            {account._count && (
                              <span className="text-gray-400">
                                {' '}· {account._count.dmAutomations} DM · {account._count.commentRules} comment rules
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDisconnect(account)}
                        aria-label={`Disconnect ${account.username || 'account'}`}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                        title="Disconnect account"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Permission scopes this integration requests */}
          <GlassCard>
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-pink-500" /> Permissions requested
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              These are the scopes WabMeta asks Meta for. Granted scopes are confirmed on Meta's side during login.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { scope: 'instagram_manage_messages', desc: 'Send and receive Direct Messages' },
                { scope: 'instagram_manage_comments', desc: 'Read and reply to comments' },
                { scope: 'instagram_basic', desc: 'Read profile details and media' },
                { scope: 'pages_read_engagement', desc: 'Read the linked Page’s engagement' },
              ].map((p) => (
                <div key={p.scope} className="p-3 border border-gray-100 rounded-xl flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono font-bold text-gray-800 block break-all">{p.scope}</span>
                    <span className="text-[10px] text-gray-400">{p.desc}</span>
                  </div>
                  {isConnected ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Setup checklist */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-pink-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Before you connect</h4>
            </div>

            <ul className="space-y-2.5 text-xs">
              {[
                'Switch your Instagram account to Creator or Business',
                'Link it to a Facebook Page you administer',
                'In Instagram: Settings → Privacy → Messages → allow access to messages',
                'You must have admin rights on that Facebook Page',
              ].map((item, idx) => (
                <li key={idx} className="flex gap-2 text-gray-500">
                  <span className="text-pink-500 font-bold shrink-0">✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="https://developers.facebook.com/docs/instagram-api"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-[10px] text-pink-600 hover:underline font-semibold"
            >
              Official setup documentation <ExternalLink size={10} />
            </a>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Token security</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Access tokens are stored server-side and are never sent to your browser. They are used only when
              WabMeta calls the Instagram Graph API on your behalf.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramSettings;
