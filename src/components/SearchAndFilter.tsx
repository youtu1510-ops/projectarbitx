import React from 'react';
import { Search, Filter } from 'lucide-react';
import { MarketState } from '../types/betting';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSport: string;
  onSportChange: (sport: string) => void;
  markets: Map<string, MarketState>;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedSport,
  onSportChange,
  markets,
}) => {
  // Extract unique sports with counts
  const sportCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    markets.forEach(market => {
      const sport = market.mainEventName?.split(' ')[0] || 'Other';
      counts.set(sport, (counts.get(sport) || 0) + 1);
    });
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [markets]);

  return (
    <div className="bg-base-100 shadow-lg rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="form-control">
            <div className="input-group">
              <span className="bg-base-200">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search events, leagues, markets..."
                className="input input-bordered flex-1"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sport Filter */}
        <div className="lg:w-64">
          <div className="form-control">
            <div className="input-group">
              <span className="bg-base-200">
                <Filter className="h-4 w-4" />
              </span>
              <select
                className="select select-bordered flex-1"
                value={selectedSport}
                onChange={(e) => onSportChange(e.target.value)}
              >
                <option value="">All Sports</option>
                {sportCounts.map(([sport, count]) => (
                  <option key={sport} value={sport}>
                    {sport} ({count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(searchQuery || selectedSport) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {searchQuery && (
            <div className="badge badge-primary gap-2">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="btn btn-ghost btn-xs"
              >
                ×
              </button>
            </div>
          )}
          {selectedSport && (
            <div className="badge badge-secondary gap-2">
              Sport: {selectedSport}
              <button
                onClick={() => onSportChange('')}
                className="btn btn-ghost btn-xs"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};