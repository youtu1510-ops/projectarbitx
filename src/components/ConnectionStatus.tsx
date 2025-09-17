import React from 'react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected';
  marketCount: number;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, marketCount }) => {
  const getStatusIndicator = () => {
    switch (status) {
      case 'connected':
        return {
          className: 'bg-success',
          text: 'Connected'
        };
      case 'connecting':
        return {
          className: 'bg-warning animate-pulse',
          text: 'Connecting'
        };
      case 'disconnected':
      default:
        return {
          className: 'bg-error',
          text: 'Disconnected'
        };
    }
  };

  const { className, text } = getStatusIndicator();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-base-content/70">
        {status === 'connected' ? `${marketCount} markets` : '--'}
      </span>
      <div className="flex items-center gap-2" title={text}>
        <div className={`w-3 h-3 rounded-full ${className}`}></div>
        <span className="text-sm font-semibold">{text}</span>
      </div>
    </div>
  );
};