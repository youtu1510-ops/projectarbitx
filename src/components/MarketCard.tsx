import React from 'react';
import { MarketState, Runner } from '../types/betting';
import { SoccerBall } from './SoccerBall';
import { AlertTriangle, Clock } from 'lucide-react';

interface MarketCardProps {
  market: MarketState;
  changes: Map<string, any>;
  onRemove: (marketId: string) => void;
}

// Helper to get the best back and lay odds for a runner
const getBestOdds = (runner: Runner) => {
  const bestBack = runner.bdatb.length > 0 ? runner.bdatb[0] : { odds: 0 };
  const bestLay = runner.bdatl.length > 0 ? runner.bdatl[0] : { odds: 0 };
  return { bestBack, bestLay };
};

// Helper to calculate the arbitrage opportunity
const calculateArbitrage = (runners: Runner[]) => {
  if (runners.length < 2) return 0;

  const odds = runners.map(r => getBestOdds(r).bestBack.odds);
  const inverseOdds = odds.reduce((acc, odd) => acc + (1 / (odd || 1)), 0);
  
  if (inverseOdds === 0) return 0;

  return (1 - inverseOdds) * 100;
};

export const MarketCard: React.FC<MarketCardProps> = ({ market, changes, onRemove }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getRunnerName = (runner: Runner) => {
    const { id, hc } = runner;
    if (market.marketDefinition?.marketType === 'MATCH_ODDS') {
      const nameMap: Record<string, string> = { '47972': 'Home', '47973': 'Away', '58805': 'Draw' };
      return nameMap[id] || `Sel ${id}`;
    }
    if (hc !== null && hc !== undefined) {
      const isOver = parseFloat(id) % 2 === 0;
      return `${isOver ? 'Over' : 'Under'} ${Math.abs(hc)}`;
    }
    return `Sel ${id}`;
  };

  const allRunners = Array.from(market.runners.values());
  const arbitrage = calculateArbitrage(allRunners);

  const isSuspended = market.marketDefinition?.status === 'SUSPENDED';
  const status = market.marketDefinition?.status;

  return (
    <div className={`bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-4 relative overflow-hidden transition-opacity ${isSuspended ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <SoccerBall className="w-5 h-5 mr-3 text-gray-400" />
          <div>
            <p className="font-bold text-base">{market.mainEventName}</p>
            <p className="text-xs text-gray-400">{market.marketNameWithParents}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold text-lg ${arbitrage > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {arbitrage.toFixed(1)}%
          </div>
          {status === 'OPEN' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                  OPEN
              </span>
          )}
          {status === 'SUSPENDED' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                  SUSPENDED
              </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        {allRunners.map(runner => {
          const { bestBack, bestLay } = getBestOdds(runner);
          const runnerId = `${runner.id}-${runner.hc || 0}`;

          const backChange = changes.get(`${runnerId}-back-0`);
          const layChange = changes.get(`${runnerId}-lay-0`);

          const backAnimation = backChange === 'up' ? 'animate-flash-green' : backChange === 'down' ? 'animate-flash-red' : '';
          const layAnimation = layChange === 'up' ? 'animate-flash-green' : layChange === 'down' ? 'animate-flash-red' : '';
          
          return (
            <div key={runner.id} className="grid grid-cols-3 items-center my-1 py-1">
              <div className="col-span-1 text-sm text-gray-300">
                {getRunnerName(runner)}
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-2 text-center">
                <div className={`py-1 rounded ${backAnimation}`}>
                  <p className="font-bold text-lg text-blue-400">{bestBack.odds > 0 ? bestBack.odds.toFixed(2) : '--'}</p>
                  <p className="text-xs text-gray-500">Back</p>
                </div>
                <div className={`py-1 rounded ${layAnimation}`}>
                  <p className="font-bold text-lg text-pink-400">{bestLay.odds > 0 ? bestLay.odds.toFixed(2) : '--'}</p>
                  <p className="text-xs text-gray-500">Lay</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3"/>
          <span>{formatTime(market.mainEventStartTime)}</span>
        </div>
        <button className="focus:outline-none hover:text-white" onClick={() => onRemove(market.id)}>
          <span role="img" aria-label="delete">🗑️</span>
        </button>
      </div>
    </div>
  );
};