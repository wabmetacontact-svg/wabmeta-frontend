import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export const useInstagramConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectInstagram = () => {
    setIsConnecting(true);

    // Check if FB SDK is loaded
    if (!(window as any).FB) {
      toast.error("Facebook SDK not loaded yet. Please refresh.");
      setIsConnecting(false);
      return;
    }

    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const { accessToken, userID } = response.authResponse;
        
        // Step 2: Send this token to our backend to exchange for long-lived token
        handleBackendConnection(accessToken, userID);
      } else {
        toast.error("User cancelled login or did not fully authorize.");
        setIsConnecting(false);
      }
    }, {
      // Permissions required for Instagram Automation
      scope: 'instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_manage_metadata,pages_read_engagement'
    });
  };

  const handleBackendConnection = async (token: string, fbUserId: string) => {
    try {
      const orgId = localStorage.getItem('selected_organization_id');
      const res = await api.post('/instagram/connect', { 
        accessToken: token, 
        fbUserId 
      }, {
        headers: { 'X-Organization-Id': orgId }
      });

      if (res.data.success) {
        toast.success("Instagram connected successfully!");
        window.location.reload(); // Refresh to show connected state
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to link Instagram");
    } finally {
      setIsConnecting(false);
    }
  };

  return { connectInstagram, isConnecting };
};
