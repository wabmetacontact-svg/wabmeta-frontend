// src/hooks/useCampaignRealtime.ts - PRODUCTION READY

import { useEffect, useState, useCallback, useRef } from 'react';
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

interface ContactStatusUpdate {
  contactId: string;
  phone: string;
  status: string;
  messageId?: string;
  error?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  timestamp: string;
}

export const useCampaignRealtime = (campaignId: string | null) => {
  const { socket, isConnected } = useSocket();
  const joinedRef = useRef(false);
  const joinedCampaignRef = useRef<string | null>(null);

  const [progress, setProgress] = useState<CampaignProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedStats, setCompletedStats] = useState<CompletedStats | null>(null);
  
  // ✅ NEW: Map for per-contact real-time updates
  const [contactStatusMap, setContactStatusMap] = useState<Map<string, ContactStatusUpdate>>(new Map());
  
  const [campaignError, setCampaignError] = useState<{ message: string; code?: string } | null>(null);

  // ✅ Join/leave campaign room
  useEffect(() => {
    if (!socket || !isConnected || !campaignId) return;

    // Leave previous campaign if switched
    if (joinedCampaignRef.current && joinedCampaignRef.current !== campaignId) {
      socket.emit('campaign:leave', joinedCampaignRef.current);
      joinedRef.current = false;
    }

    if (!joinedRef.current || joinedCampaignRef.current !== campaignId) {
      socket.emit('campaign:join', campaignId);
      joinedRef.current = true;
      joinedCampaignRef.current = campaignId;
      console.log(`🔌 Joined campaign room: ${campaignId}`);
    }

    return () => {
      if (joinedRef.current && joinedCampaignRef.current === campaignId) {
        socket.emit('campaign:leave', campaignId);
        joinedRef.current = false;
        joinedCampaignRef.current = null;
      }
    };
  }, [socket, isConnected, campaignId]);

  // ✅ Listen for all campaign events
  useEffect(() => {
    if (!socket || !campaignId) return;

    const handleUpdate = (data: any) => {
      if (data.campaignId !== campaignId) return;

      if (data.status === 'RUNNING') {
        setIsProcessing(true);
      } else if (['COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'].includes(data.status)) {
        setIsProcessing(false);
      }
    };

    const handleProgress = (data: any) => {
      if (data.campaignId !== campaignId) return;

      setProgress({
        sent: data.sent || 0,
        failed: data.failed || 0,
        delivered: data.delivered || 0,
        read: data.read || 0,
        total: data.total || 0,
        percentage: data.percentage || 0,
        status: data.status || 'RUNNING',
      });

      if (data.status === 'RUNNING') {
        setIsProcessing(true);
      }
    };

    // ✅ NEW: Per-contact status update
    const handleContactStatus = (data: any) => {
      if (data.campaignId !== campaignId) return;
      if (!data.contactId) return;

      setContactStatusMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.contactId, {
          contactId: data.contactId,
          phone: data.phone,
          status: data.status,
          messageId: data.messageId,
          error: data.error,
          sentAt: data.sentAt,
          deliveredAt: data.deliveredAt,
          readAt: data.readAt,
          failedAt: data.failedAt,
          timestamp: data.timestamp || new Date().toISOString(),
        });
        return newMap;
      });
    };

    const handleCompleted = (data: any) => {
      if (data.campaignId !== campaignId) return;

      setCompletedStats({
        sentCount: data.sentCount || 0,
        failedCount: data.failedCount || 0,
        deliveredCount: data.deliveredCount || 0,
        readCount: data.readCount || 0,
        totalRecipients: data.totalRecipients || 0,
      });
      setIsProcessing(false);
    };

    const handleCampaignError = (data: any) => {
      if (data.campaignId !== campaignId) return;
      setCampaignError({ message: data.message, code: data.code });
      setIsProcessing(false);
    };

    socket.on('campaign:update', handleUpdate);
    socket.on('campaign:progress', handleProgress);
    socket.on('campaign:contact', handleContactStatus);
    socket.on('campaign:contact:status', handleContactStatus);
    socket.on('campaign:completed', handleCompleted);
    socket.on('campaign:error', handleCampaignError);

    return () => {
      socket.off('campaign:update', handleUpdate);
      socket.off('campaign:progress', handleProgress);
      socket.off('campaign:contact', handleContactStatus);
      socket.off('campaign:contact:status', handleContactStatus);
      socket.off('campaign:completed', handleCompleted);
      socket.off('campaign:error', handleCampaignError);
    };
  }, [socket, campaignId]);

  const resetStats = useCallback(() => {
    setProgress(null);
    setCompletedStats(null);
    setIsProcessing(false);
    setContactStatusMap(new Map());
    setCampaignError(null);
  }, []);

  const clearContactUpdates = useCallback(() => {
    setContactStatusMap(new Map());
  }, []);

  return {
    progress,
    isProcessing,
    completedStats,
    contactStatusMap,           // ✅ NEW
    contactUpdates: Array.from(contactStatusMap.values()),  // For backward compat
    campaignError,
    isConnected,
    clearContactUpdates,        // ✅ NEW
    resetStats,
  };
};

export default useCampaignRealtime;