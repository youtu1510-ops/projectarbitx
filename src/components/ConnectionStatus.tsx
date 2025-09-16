import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected';
  marketCount: number;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, marketCount }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4" />;
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'badge-success';
      case 'connecting':
        return 'badge-warning';
      case 'disconnected':
        return 'badge-error';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return `Connected (${marketCount} markets)`;
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
    }
  };

  return (
    <div className={`badge ${getStatusColor()} gap-2`}>
      {getStatusIcon()}
      <span className="text-xs">{getStatusText()}</span>
    </div>
  );
};