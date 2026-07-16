// src/hooks/useCampaignRealtime.ts - FIXED
import {
  useEffect, useState, useCallback, useRef,
} from 'react';
import { useSocket } from '../context/SocketContext';

// ─── Types ───────────────────────────────────────────────────
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

interface ContactStatusUpdate {
  contactId: string;
  phone: string;
  status: string;
  messageId?: string;
  error?: string;
  timestamp: string;
}

// ✅ FIX Bug1: Use plain object instead of Map for React state
type ContactStatusRecord = Record<string, ContactStatusUpdate>;

// ✅ FIX Bug4: Max contacts to track in memory
const MAX_CONTACT_UPDATES = 500;

// ─── Hook ─────────────────────────────────────────────────────
export const useCampaignRealtime = (campaignId: string | null) => {
  const { socket, isConnected } = useSocket();

  const [progress, setProgress] = useState<CampaignProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedStats, setCompletedStats] = useState<CompletedStats | null>(null);
  // ✅ FIX Bug1: Plain object instead of Map
  const [contactStatusRec, setContactStatusRec] = useState<ContactStatusRecord>({});
  const [campaignError, setCampaignError] = useState<{
    message: string; code?: string;
  } | null>(null);

  // Track join state
  const joinedCampaignRef = useRef<string | null>(null);

  // ✅ FIX Bug4: Track count to enforce limit
  const contactCountRef = useRef(0);

  // ─── Join/leave campaign room ─────────────────────────────
  // ✅ FIX Bug2: Re-join on socket reconnect (isConnected in deps)
  useEffect(() => {
    if (!socket || !isConnected || !campaignId) return;

    // Leave old room if campaign changed
    if (
      joinedCampaignRef.current &&
      joinedCampaignRef.current !== campaignId
    ) {
      socket.emit('campaign:leave', joinedCampaignRef.current);
      joinedCampaignRef.current = null;
    }

    // Join new room
    socket.emit('campaign:join', campaignId);
    joinedCampaignRef.current = campaignId;

    return () => {
      if (joinedCampaignRef.current) {
        socket.emit('campaign:leave', joinedCampaignRef.current);
        joinedCampaignRef.current = null;
      }
    };
  }, [socket, isConnected, campaignId]); // ✅ isConnected = rejoin on reconnect

  // ─── Event listeners ──────────────────────────────────────
  useEffect(() => {
    if (!socket || !campaignId) return;

    const onUpdate = (data: any) => {
      if (data.campaignId !== campaignId) return;

      const status = data.status;
      if (status === 'RUNNING') {
        setIsProcessing(true);
      } else if (
        ['COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'].includes(status)
      ) {
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

      // ✅ FIX Bug4: Enforce memory limit
      if (contactCountRef.current >= MAX_CONTACT_UPDATES) {
        // Stop tracking new contacts to prevent memory leak
        return;
      }

      // ✅ FIX Bug1 & Bug3: Plain object update (no Map)
      setContactStatusRec(prev => {
        // If contact already exists, update; else increment count
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

  // ─── Helpers ──────────────────────────────────────────────
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

  // ✅ FIX Bug1: Convert to Map only when needed (memoized)
  // CampaignDetails uses contactStatusMap (Map type)
  // We expose a getter that converts lazily
  const contactStatusMap = new Map(
    Object.entries(contactStatusRec)
  );

  return {
    progress,
    isProcessing,
    completedStats,
    // ✅ Map for CampaignDetails.tsx compatibility
    contactStatusMap,
    // ✅ Array for any component that needs array
    contactUpdates: Object.values(contactStatusRec),
    campaignError,
    isConnected,
    resetStats,
    clearContactUpdates,
  };
};

export default useCampaignRealtime;