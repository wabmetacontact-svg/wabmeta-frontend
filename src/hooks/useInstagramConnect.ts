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
      // The organization comes from the JWT server-side; sending a header here
      // was both ignored and read from a key that is never written.
      const res = await api.post('/instagram/connect', {
        accessToken: token,
        fbUserId,
      });

      if (res.data.success) {
        // Report what actually happened, including a failed webhook subscription.
        const msg: string = res.data.message || 'Instagram connected';
        if (msg.toLowerCase().includes('webhook subscription failed')) {
          toast.error(msg, { duration: 9000 });
        } else {
          toast.success(msg);
        }
        window.location.reload();
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
