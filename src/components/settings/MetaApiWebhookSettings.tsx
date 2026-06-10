import React, { useEffect, useState } from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

type MetaSettings = {
  connected: boolean;
  status?: string;
  waba?: { id: string; name?: string };
  phoneNumbers?: Array<{
    id: string;
    phoneNumberId: string;
    number: string;
    verifiedName?: string;
    qualityRating?: string;
    isPrimary?: boolean;
  }>;
  token?: { masked?: string | null; expiresAt?: string };
  webhook?: { callbackUrl?: string; verifyTokenMasked?: string | null };
  graphApiVersion?: string;
};

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs font-medium text-slate-500 sm:w-48 shrink-0">{label}</span>
    <span className="text-sm text-slate-900 font-mono break-all">{value || '—'}</span>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-5 mb-2 px-1">
    {children}
  </h4>
);

const MetaApiWebhookSettings: React.FC = () => {
  const [data, setData] = useState<MetaSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/meta/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const json = await res.json();
        if (json?.success) setData(json.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6 bg-white border border-slate-200 rounded-xl">
        <Loader2 className="w-5 h-5 animate-spin text-green-600" />
        <span className="text-sm text-slate-500">Loading Meta settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          WhatsApp API & Webhook
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          View your Meta API configuration and webhook details
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Status Banner */}
        <div className={`px-5 py-3 flex items-center gap-2 ${
          data?.connected
            ? 'bg-green-50 border-b border-green-200'
            : 'bg-red-50 border-b border-red-200'
        }`}>
          {data?.connected ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Connected</span>
              {data.status && (
                <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  {data.status}
                </span>
              )}
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">Not Connected</span>
            </>
          )}
        </div>

        {!data?.connected ? (
          <div className="p-6 text-center">
            <p className="text-slate-500 text-sm">
              No Meta account connected yet. Go to{' '}
              <span className="font-medium text-green-600">WhatsApp Connection</span>{' '}
              tab to connect.
            </p>
          </div>
        ) : (
          <div className="px-5 py-4">
            {/* WABA Info */}
            <SectionTitle>WhatsApp Business Account</SectionTitle>
            <InfoRow label="WABA ID" value={data.waba?.id} />
            <InfoRow label="WABA Name" value={data.waba?.name} />

            {/* Phone Numbers */}
            {(data.phoneNumbers || []).length > 0 && (
              <>
                <SectionTitle>Phone Numbers</SectionTitle>
                <div className="space-y-3">
                  {(data.phoneNumbers || []).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1"
                    >
                      <InfoRow label="Phone Number ID" value={p.phoneNumberId} />
                      <InfoRow label="Number" value={p.number} />
                      {p.verifiedName && (
                        <InfoRow label="Verified Name" value={p.verifiedName} />
                      )}
                      {p.qualityRating && (
                        <InfoRow label="Quality Rating" value={p.qualityRating} />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Token */}
            <SectionTitle>Access Token</SectionTitle>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <InfoRow label="Stored Token (masked)" value={data.token?.masked} />
              {data.token?.expiresAt && (
                <InfoRow
                  label="Expires At"
                  value={new Date(data.token.expiresAt).toLocaleString()}
                />
              )}
              <p className="text-xs text-slate-400 mt-2">
                🔒 Full token is encrypted and not shown for security.
              </p>
            </div>

            {/* Webhook */}
            <SectionTitle>Webhook Configuration</SectionTitle>
            <InfoRow label="Callback URL" value={data.webhook?.callbackUrl} />
            <InfoRow label="Verify Token (masked)" value={data.webhook?.verifyTokenMasked} />
            <InfoRow label="Graph API Version" value={data.graphApiVersion} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaApiWebhookSettings;