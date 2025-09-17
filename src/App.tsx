import React, { useState, useMemo } from 'react';
import { RefreshCw, AlertCircle, Search, Filter } from 'lucide-react';
import { useBettingData } from './hooks/useBettingData';
import { MarketCard } from './components/MarketCard';
import { MarketState } from './types/betting';
import Fuse from 'fuse.js';

function App() {
  const {
    markets,
    loading,
    error,
    connectionStatus,
    getMarketChanges,
    removeMarket,
    refetch,
  } = useBettingData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedMarketName, setSelectedMarketName] = useState('');
  const [sortBy, setSortBy] = useState('mainEventStartTime');
  const [showInPlayOnly, setShowInPlayOnly] = useState(false);

  const getMarketUniqueId = (market: MarketState) => {
    return `${market.mainEventName}-${market.marketNameWithParents}`;
  };

  const allMarkets = useMemo(() => Array.from(markets.values()), [markets]);

  const fuse = useMemo(() => new Fuse(allMarkets, {
    keys: ['mainEventName', 'marketNameWithParents', 'marketDefinition.marketType'],
    threshold: 0.4,
  }), [allMarkets]);

  const sportCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allMarkets.forEach(market => {
      const sport = market.mainEventName?.split(' ')[0] || 'Other';
      counts.set(sport, (counts.get(sport) || 0) + 1);
    });
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [allMarkets]);

  const marketNameCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allMarkets.forEach(market => {
        counts.set(market.marketNameWithParents, (counts.get(market.marketNameWithParents) || 0) + 1);
    });
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
}, [allMarkets]);

  const filteredMarkets = useMemo(() => {
    let marketsToFilter = allMarkets;

    if (searchQuery) {
        marketsToFilter = fuse.search(searchQuery).map(result => result.item);
    }

    return marketsToFilter
      .filter((market) => {
        const isInPlay = market.marketDefinition?.inPlay == true;
        return (
          (selectedSport === '' || market.mainEventName.startsWith(selectedSport)) &&
          (selectedMarketName === '' || market.marketNameWithParents === selectedMarketName) &&
          (!showInPlayOnly || isInPlay)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'mainEventStartTime') {
          return a.mainEventStartTime - b.mainEventStartTime;
        }
        if (sortBy === 'mainEventName') {
          return a.mainEventName.localeCompare(b.mainEventName);
        }
        return 0;
      })
      .filter(
        (market, index, self) =>
          index === self.findIndex((m) => getMarketUniqueId(m) === getMarketUniqueId(market))
      );
  }, [searchQuery, selectedSport, selectedMarketName, sortBy, showInPlayOnly, allMarkets, fuse]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center"><p className="text-lg">Loading opportunities...</p></div>
      </div>
    );
  }

  if (error && filteredMarkets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="card bg-gray-800 shadow-xl max-w-md text-white">
          <div className="card-body text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="card-title text-red-400">Connection Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button className="btn btn-primary bg-blue-600 hover:bg-blue-700" onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="navbar bg-gray-800 shadow-lg px-4">
        <div className="navbar-start">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <div className="navbar-end gap-2">
          <div className="btn-group">
            <button
              className={`btn btn-sm ${!showInPlayOnly ? 'btn-active' : ''}`}
              onClick={() => setShowInPlayOnly(false)}
            >
              All
            </button>
            <button
              className={`btn btn-sm ${showInPlayOnly ? 'btn-active' : ''}`}
              onClick={() => setShowInPlayOnly(true)}
            >
              In-Play
            </button>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <Filter className="h-5 w-5" />
            </label>
            <div tabIndex={0} className="dropdown-content menu p-4 shadow bg-base-100 rounded-box w-80 space-y-4">
              <div>
                <label className="label"><span className="label-text text-lg font-semibold">Search & Filter</span></label>
                <div className="form-control">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Fuzzy search..."
                      className="input input-bordered w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="bg-base-200"><Search className="h-4 w-4" /></span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="label"><span className="label-text">Filter by Sport</span></label>
                <select
                  className="select select-bordered w-full"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                >
                  <option value="">All Sports</option>
                  {sportCounts.map(([sport, count]) => (
                    <option key={sport} value={sport}>{sport} ({count})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label"><span className="label-text">Filter by Market</span></label>
                <select
                  className="select select-bordered w-full"
                  value={selectedMarketName}
                  onChange={(e) => setSelectedMarketName(e.target.value)}
                >
                  <option value="">All Markets</option>
                  {marketNameCounts.map(([name, count]) => (
                    <option key={name} value={name}>{name} ({count})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label"><span className="label-text">Sort by</span></label>
                <select
                  className="select select-bordered w-full"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="mainEventStartTime">Start Time</option>
                  <option value="mainEventName">Event Name</option>
                </select>
              </div>
            </div>
          </div>

          <button className="btn btn-ghost btn-circle" onClick={refetch}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="text-sm text-gray-400 mb-4">
          {connectionStatus === 'connected' ? `Connected. Showing ${filteredMarkets.length} of ${allMarkets.length} opportunities` : 'Connecting...'}
        </div>

        {error && (
          <div className="alert alert-error bg-red-900 text-red-200 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {filteredMarkets.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No matching markets found.</p>
            <p className="text-sm text-gray-600 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMarkets.map(market => (
              <MarketCard
                key={getMarketUniqueId(market)}
                market={market}
                changes={getMarketChanges(market.id)}
                onRemove={() => removeMarket(market.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
