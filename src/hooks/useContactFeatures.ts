import { useState, useEffect } from 'react';
import api from '../services/api';

interface FeatureAccess {
    simpleBulkPaste: boolean;
    csvUpload: boolean;
    currentPlan: string;
    upgradeRequired: boolean;
    upgradeMessage?: string;
}

export function useContactFeatures() {
    const [features, setFeatures] = useState<FeatureAccess>({
        simpleBulkPaste: false,
        csvUpload: false,
        currentPlan: 'FREE_DEMO',
        upgradeRequired: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            const { data } = await api.get('/contacts/feature-access');
            setFeatures(data.data);
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                setFeatures({
                    simpleBulkPaste: false,
                    csvUpload: false,
                    currentPlan: 'FREE_DEMO',
                    upgradeRequired: true
                });
            } else {
                console.error('Failed to fetch features:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return { features, loading, refetch: fetchFeatures };
}
