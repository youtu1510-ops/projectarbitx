import React from 'react';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { MarketState, Runner } from '../types/betting';

interface MarketCardProps {
  market: MarketState;
  changes: Map<string, any>;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, changes }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? odds.toFixed(2) : '-';
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toFixed(0);
  };

  const getRunnerName = (runner: Runner) => {
    const { id, hc } = runner;
    
    // For match odds, try to map selection IDs to names
    if (market.marketDefinition?.marketType === 'MATCH_ODDS') {
      const nameMap: Record<string, string> = {
        '47972': 'Home',
        '47973': 'Away',
        '58805': 'Draw'
      };
      return nameMap[id] || `Selection ${id}`;
    }
    
    // For totals/handicaps, format with handicap value
    if (hc !== null && hc !== undefined) {
      const isOver = parseFloat(id) % 2 === 0;
      return `${isOver ? 'Over' : 'Under'} ${Math.abs(hc)}`;
    }
    
    return `Sel ${id}`;
  };

  const getChangeAnimation = (key: string) => {
    const change = changes.get(key);
    if (!change) return '';
    return change === 'up' ? 'animate-flash-green' : 'animate-flash-red';
  };

  const isLive = market.marketDefinition?.inPlay && market.status === 'OPEN';
  const isSuspended = market.status === 'SUSPENDED';

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isLive && (
                <div className="badge badge-error badge-sm animate-pulse-slow">
                  <div className="w-2 h-2 bg-current rounded-full mr-1"></div>
                  LIVE
                </div>
              )}
              {isSuspended && (
                <div className="badge badge-warning badge-sm">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  SUSPENDED
                </div>
              )}
              <span className="badge badge-outline badge-sm">
                {market.marketDefinition?.marketType || 'Unknown'}
              </span>
            </div>
            
            <h3 className="card-title text-sm font-semibold">
              {market.mainEventName}
            </h3>
            
            <p className="text-xs text-base-content/70">
              {market.marketNameWithParents}
            </p>
            
            <div className="flex items-center gap-1 mt-1 text-xs text-base-content/60">
              <Clock className="w-3 h-3" />
              {formatTime(market.mainEventStartTime)}
            </div>
          </div>
        </div>

        {/* Runners */}
        <div className="space-y-3">
          {Array.from(market.runners.entries()).map(([runnerId, runner]) => (
            <div key={runnerId} className="border border-base-300 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">
                  {getRunnerName(runner)}
                </span>
                {runner.tv && runner.tv > 0 && (
                  <div className="flex items-center gap-1 text-xs text-base-content/60">
                    <TrendingUp className="w-3 h-3" />
                    {market.currency} {formatAmount(runner.tv)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Back (Blue) */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-600 mb-1">Back</h4>
                  <div className="space-y-1">
                    {runner.bdatb.slice(0, 3).map((level, index) => (
                      <div
                        key={index}
                        className={`bg-blue-50 border border-blue-200 rounded p-2 text-xs ${
                          getChangeAnimation(`${runnerId}-back-${index}`)
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-semibold text-blue-800">
                            {formatOdds(level.odds)}
                          </span>
                          <span className="text-blue-600">
                            {formatAmount(level.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lay (Pink) */}
                <div>
                  <h4 className="text-xs font-semibold text-pink-600 mb-1">Lay</h4>
                  <div className="space-y-1">
                    {runner.bdatl.slice(0, 3).map((level, index) => (
                      <div
                        key={index}
                        className={`bg-pink-50 border border-pink-200 rounded p-2 text-xs ${
                          getChangeAnimation(`${runnerId}-lay-${index}`)
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-semibold text-pink-800">
                            {formatOdds(level.odds)}
                          </span>
                          <span className="text-pink-600">
                            {formatAmount(level.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suspended Overlay */}
        {isSuspended && (
          <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="bg-warning text-warning-content px-3 py-1 rounded-full text-sm font-semibold">
              Market Suspended
            </div>
          </div>
        )}
      </div>
    </div>
  );
};