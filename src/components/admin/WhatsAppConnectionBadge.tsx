import React from 'react';
import { Cloud, Smartphone, Server, CheckCircle, AlertCircle } from 'lucide-react';

interface ConnectionBadgeProps {
  type: 'CLOUD_API' | 'BUSINESS_APP' | 'ON_PREMISE';
  status?: 'active' | 'inactive';
  showRecommended?: boolean;
}

const WhatsAppConnectionBadge: React.FC<ConnectionBadgeProps> = ({ 
  type, 
  status = 'active',
  showRecommended = false 
}) => {
  
  const configs = {
    CLOUD_API: {
      label: 'Cloud API',
      icon: Cloud,
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-500',
      recommended: true,
    },
    WHATSAPP_BUSINESS_APP: {
      label: 'Business App',
      icon: Smartphone,
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
      borderColor: 'border-orange-500/20',
      iconColor: 'text-orange-500',
      recommended: false,
    },
    BUSINESS_APP: {
      label: 'Business App',
      icon: Smartphone,
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500',
      borderColor: 'border-orange-500/20',
      iconColor: 'text-orange-500',
      recommended: false,
    },
    ON_PREMISE: {
      label: 'On-Premise',
      icon: Server,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-500',
      recommended: false,
    },
  };

  const config = configs[type] || configs.CLOUD_API;
  const Icon = config.icon;
  const StatusIcon = status === 'active' ? CheckCircle : AlertCircle;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor}`}
      >
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
        <StatusIcon 
          className={`w-3.5 h-3.5 ${
            status === 'active' 
              ? 'text-emerald-500' 
              : 'text-gray-400'
          }`} 
        />
      </div>

      {showRecommended && config.recommended && (
        <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full font-medium">
          Recommended
        </span>
      )}
    </div>
  );
};

export default WhatsAppConnectionBadge;
