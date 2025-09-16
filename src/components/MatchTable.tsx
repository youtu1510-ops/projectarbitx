import React from 'react';
import { InPlayMatch } from '../types/betting';

interface MatchTableProps {
  matches: InPlayMatch[];
}

export const MatchTable: React.FC<MatchTableProps> = ({ matches }) => {
  if (matches.length === 0) return null;

  return (
    <div className="bg-base-100 shadow-lg rounded-lg mb-6">
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-semibold">Initial Match Data</h2>
        <p className="text-sm text-base-content/70">
          Loaded {matches.length} matches from REST API
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Sport</th>
              <th>Markets</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id}>
                <td className="font-mono text-xs">{match.id}</td>
                <td className="font-medium">{match.name}</td>
                <td>
                  <div className="badge badge-outline">{match.sport}</div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {match.markets.slice(0, 3).map((market) => (
                      <div key={market.marketId} className="badge badge-sm">
                        {market.marketName}
                      </div>
                    ))}
                    {match.markets.length > 3 && (
                      <div className="badge badge-sm badge-ghost">
                        +{match.markets.length - 3} more
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};