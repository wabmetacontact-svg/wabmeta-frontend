// src/hooks/useCampaignRealtime.ts - COMPLETE FIXED VERSION

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

interface ContactUpdate {
    contactId: string;
    phone: string;
    status: string;
    messageId?: string;
    error?: string;
    timestamp: string;
}

export const useCampaignRealtime = (campaignId: string | null) => {
    const { socket, isConnected } = useSocket();
    const joinedRef = useRef(false);

    const [progress, setProgress] = useState<CampaignProgress | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedStats, setCompletedStats] = useState<CompletedStats | null>(null);
    const [contactUpdates, setContactUpdates] = useState<ContactUpdate[]>([]);
    const [campaignError, setCampaignError] = useState<{ message: string; code?: string } | null>(null);

    // Join campaign room
    useEffect(() => {
        if (!socket || !isConnected || !campaignId) return;

        if (!joinedRef.current) {
            console.log(`🔌 [SOCKET] Joining campaign room: ${campaignId}`);
            socket.emit('campaign:join', campaignId);
            joinedRef.current = true;
        }

        return () => {
            if (joinedRef.current) {
                console.log(`🔌 [SOCKET] Leaving campaign room: ${campaignId}`);
                socket.emit('campaign:leave', campaignId);
                joinedRef.current = false;
            }
        };
    }, [socket, isConnected, campaignId]);

    // Listen for all campaign events
    useEffect(() => {
        if (!socket || !campaignId) return;

        const handleUpdate = (data: any) => {
            console.log('📡 [REALTIME] campaign:update', data);

            if (data.campaignId !== campaignId) return;

            if (data.status === 'RUNNING') {
                setIsProcessing(true);
            } else if (['COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'].includes(data.status)) {
                setIsProcessing(false);
            }
        };

        const handleProgress = (data: any) => {
            console.log('📊 [REALTIME] campaign:progress', data);

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

        const handleContactStatus = (data: any) => {
            console.log('👤 [REALTIME] campaign:contact', data);

            if (data.campaignId !== campaignId) return;

            const newUpdate: ContactUpdate = {
                contactId: data.contactId,
                phone: data.phone,
                status: data.status,
                messageId: data.messageId,
                error: data.error,
                timestamp: data.timestamp || new Date().toISOString(),
            };

            setContactUpdates((prev) => {
                const updated = [...prev, newUpdate];
                return updated.slice(-100); // Keep last 100
            });
        };

        const handleCompleted = (data: any) => {
            console.log('🎉 [REALTIME] campaign:completed', data);

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
            console.log('❌ [REALTIME] campaign:error', data);
            if (data.campaignId !== campaignId) return;
            
            setCampaignError({
                message: data.message,
                code: data.code
            });
            setIsProcessing(false);
        };

        // Register listeners
        socket.on('campaign:update', handleUpdate);
        socket.on('campaign:progress', handleProgress);
        socket.on('campaign:contact', handleContactStatus);
        socket.on('campaign:contact:status', handleContactStatus);
        socket.on('campaign:completed', handleCompleted);
        socket.on('campaign:error', handleCampaignError);

        console.log(`✅ [SOCKET] Subscribed to campaign events: ${campaignId}`);

        return () => {
            socket.off('campaign:update', handleUpdate);
            socket.off('campaign:progress', handleProgress);
            socket.off('campaign:contact', handleContactStatus);
            socket.off('campaign:contact:status', handleContactStatus);
            socket.off('campaign:completed', handleCompleted);
            socket.off('campaign:error', handleCampaignError);
        };
    }, [socket, campaignId]);

    const clearUpdates = useCallback(() => {
        setContactUpdates([]);
    }, []);

    const resetStats = useCallback(() => {
        setProgress(null);
        setCompletedStats(null);
        setIsProcessing(false);
        setContactUpdates([]);
    }, []);

    return {
        progress,
        isProcessing,
        completedStats,
        contactUpdates,
        campaignError,
        isConnected,
        clearUpdates,
        resetStats,
    };
};

export default useCampaignRealtime;