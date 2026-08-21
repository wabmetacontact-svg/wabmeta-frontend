// src/hooks/useCampaignRealtime.ts
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';

interface CampaignProgress {
  sent: number;
  failed: number;
  delivered: number;
  read: number;
  total: number;
  percentage: number;
  status: string;
}

interface CompletedStats {
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  readCount: number;
  totalRecipients: number;
}

export interface ContactStatusUpdate {
  contactId: string;
  phone: string;
  status: string;
  messageId?: string;
  error?: string;
  timestamp: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
}

type ContactStatusRecord = Record<string, ContactStatusUpdate>;
const MAX_CONTACT_UPDATES = 500;

export const useCampaignRealtime = (campaignId: string | null) => {
  const { socket, isConnected } = useSocket();

  const [progress, setProgress] = useState<CampaignProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedStats, setCompletedStats] = useState<CompletedStats | null>(null);
  const [contactStatusRec, setContactStatusRec] = useState<ContactStatusRecord>({});
  const [campaignError, setCampaignError] = useState<{ message: string; code?: string } | null>(null);

  const joinedCampaignRef = useRef<string | null>(null);
  const contactCountRef = useRef(0);

  // ✅ Initial Sync - Added Unmounted components leak validation checks
  useEffect(() => {
    if (!campaignId) return;
    let isMounted = true;

    import('../services/api').then(({ campaigns: campaignsApi }) => {
      if (!isMounted) return;
      campaignsApi.getById(campaignId).then((res: any) => {
        if (!isMounted) return;
        const c = res.data?.data;
        if (!c) return;

        if (c.status === 'RUNNING') {
          setIsProcessing(true);
          setProgress({
            sent: c.sentCount || 0,
            failed: c.failedCount || 0,
            delivered: c.deliveredCount || 0,
            read: c.readCount || 0,
            total: c.totalContacts || 0,
            percentage: c.totalContacts > 0 ? Math.round((c.sentCount / c.totalContacts) * 100) : 0,
            status: 'RUNNING',
          });
        }
      }).catch(() => { });
    });

    return () => { isMounted = false; };
  }, [campaignId]);

  // ✅ FIXED: Room Joining Engine — Re-registers room subscription on connections drop restoral!
  useEffect(() => {
    if (!socket || !isConnected || !campaignId) return;

    const performRoomJoin = () => {
      // Leave pre-existing room if it doesn't match current ID
      if (joinedCampaignRef.current && joinedCampaignRef.current !== campaignId) {
        socket.emit('campaign:leave', joinedCampaignRef.current);
        joinedCampaignRef.current = null;
      }

      // Re-emit room sync parameters safely
      socket.emit('campaign:join', campaignId);
      joinedCampaignRef.current = campaignId;
      console.log(`🔌 [Socket Room] Safely registered room subscription: ${campaignId}`);
    };

    performRoomJoin();

    // Re-join room explicitly when socket establishes reconnect handshakes
    const handleReconnect = () => {
      console.log('🔄 [Socket Reconnect] Re-establishing campaign room subscription...');
      performRoomJoin();
    };

    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('reconnect', handleReconnect);
      if (joinedCampaignRef.current) {
        socket.emit('campaign:leave', joinedCampaignRef.current);
        joinedCampaignRef.current = null;
      }
    };
  }, [socket, isConnected, campaignId]);

  // Listening loops
  useEffect(() => {
    if (!socket || !campaignId) return;

    const onUpdate = (data: any) => {
      if (data.campaignId !== campaignId) return;
      const status = data.status;
      if (status === 'RUNNING') {
        setIsProcessing(true);
      } else if (['COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'].includes(status)) {
        setIsProcessing(false);
      }
    };

    const onProgress = (data: any) => {
      if (data.campaignId !== campaignId) return;
      setProgress({
        sent: Math.max(0, data.sent || 0),
        failed: Math.max(0, data.failed || 0),
        delivered: Math.max(0, data.delivered || 0),
        read: Math.max(0, data.read || 0),
        total: Math.max(0, data.total || 0),
        percentage: Math.min(100, Math.max(0, data.percentage || 0)),
        status: data.status || 'RUNNING',
      });
      if (data.status === 'RUNNING') setIsProcessing(true);
    };

    const onContactStatus = (data: any) => {
      if (data.campaignId !== campaignId) return;
      if (!data.contactId) return;

      if (contactCountRef.current >= MAX_CONTACT_UPDATES) return;

      setContactStatusRec(prev => {
        if (!prev[data.contactId]) {
          contactCountRef.current++;
        }
        return {
          ...prev,
          [data.contactId]: {
            contactId: data.contactId,
            phone: data.phone || '',
            status: data.status || 'SENT',
            messageId: data.messageId,
            error: data.error,
            timestamp: data.timestamp || new Date().toISOString(),
            sentAt: data.sentAt,
            deliveredAt: data.deliveredAt,
            readAt: data.readAt,
            failedAt: data.failedAt,
          },
        };
      });
    };

    const onCompleted = (data: any) => {
      if (data.campaignId !== campaignId) return;
      setCompletedStats({
        sentCount: Math.max(0, data.sentCount || 0),
        failedCount: Math.max(0, data.failedCount || 0),
        deliveredCount: Math.max(0, data.deliveredCount || 0),
        readCount: Math.max(0, data.readCount || 0),
        totalRecipients: Math.max(0, data.totalRecipients || 0),
      });
      setIsProcessing(false);
    };

    const onError = (data: any) => {
      if (data.campaignId !== campaignId) return;
      setCampaignError({
        message: data.message || 'Campaign error occurred',
        code: data.code,
      });
      setIsProcessing(false);
    };

    socket.on('campaign:update', onUpdate);
    socket.on('campaign:progress', onProgress);
    socket.on('campaign:contact', onContactStatus);
    socket.on('campaign:contact:status', onContactStatus);
    socket.on('campaign:completed', onCompleted);
    socket.on('campaign:error', onError);

    return () => {
      socket.off('campaign:update', onUpdate);
      socket.off('campaign:progress', onProgress);
      socket.off('campaign:contact', onContactStatus);
      socket.off('campaign:contact:status', onContactStatus);
      socket.off('campaign:completed', onCompleted);
      socket.off('campaign:error', onError);
    };
  }, [socket, campaignId]);

  const resetStats = useCallback(() => {
    setProgress(null);
    setCompletedStats(null);
    setIsProcessing(false);
    setContactStatusRec({});
    setCampaignError(null);
    contactCountRef.current = 0;
  }, []);

  const clearContactUpdates = useCallback(() => {
    setContactStatusRec({});
    contactCountRef.current = 0;
  }, []);

  // ✅ FIXED: Memoized Map Builder — Saves UI thread stutters, stops continuous runtime memory thrash!
  const contactStatusMap = useMemo(() => {
    return new Map(Object.entries(contactStatusRec));
  }, [contactStatusRec]);

  const contactUpdates = useMemo(() => {
    return Object.values(contactStatusRec);
  }, [contactStatusRec]);

  return {
    progress,
    isProcessing,
    completedStats,
    contactStatusMap,
    contactUpdates,
    campaignError,
    isConnected,
    resetStats,
    clearContactUpdates,
  };
};

export default useCampaignRealtime;