import React, { useState, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useBettingData } from './hooks/useBettingData';
import { SearchAndFilter } from './components/SearchAndFilter';
import { MarketCard } from './components/MarketCard';
import { ConnectionStatus } from './components/ConnectionStatus';
import { MatchTable } from './components/MatchTable';

function App() {
  const {
    matches,
    markets,
    loading,
    error,
    connectionStatus,
    getMarketChanges,
    refetch,
  } = useBettingData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [showInitialData, setShowInitialData] = useState(false);

  // Filter markets based on search and sport selection
  const filteredMarkets = useMemo(() => {
    const marketArray = Array.from(markets.values());
    
    return marketArray.filter(market => {
      const matchesSearch = !searchQuery || 
        market.mainEventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.marketNameWithParents?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.marketDefinition?.marketType?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSport = !selectedSport || 
        market.mainEventName?.toLowerCase().includes(selectedSport.toLowerCase());

      return matchesSearch && matchesSport;
    });
  }, [markets, searchQuery, selectedSport]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-lg">Loading in-play matches...</p>
        </div>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="card-title text-error">Connection Error</h2>
            <p className="text-base-content/70 mb-4">{error}</p>
            <button 
              className="btn btn-primary"
              onClick={refetch}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <h1 className="text-xl font-bold">Live Betting Exchange</h1>
        </div>
        <div className="navbar-end gap-2">
          <ConnectionStatus 
            status={connectionStatus} 
            marketCount={markets.size} 
          />
          <button 
            className="btn btn-ghost btn-sm"
            onClick={refetch}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Toggle Initial Data View */}
        {matches.length > 0 && (
          <div className="mb-6">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowInitialData(!showInitialData)}
            >
              {showInitialData ? 'Hide' : 'Show'} Initial Match Data
            </button>
          </div>
        )}

        {/* Initial Match Data Table */}
        {showInitialData && <MatchTable matches={matches} />}

        {/* Search and Filter */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
          markets={markets}
        />

        {/* Error Banner */}
        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Market Cards */}
        {filteredMarkets.length === 0 && markets.size > 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-base-content/60">
              No markets match your search criteria
            </p>
            <button
              className="btn btn-ghost btn-sm mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedSport('');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-base-content/60">
              Waiting for live market data...
            </p>
            <p className="text-sm text-base-content/50 mt-2">
              WebSocket status: {connectionStatus}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMarkets.map(market => (
              <MarketCard
                key={market.id}
                market={market}
                changes={getMarketChanges(market.id)}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 text-center text-sm text-base-content/60">
          <p>
            Showing {filteredMarkets.length} of {markets.size} markets
            {matches.length > 0 && ` • ${matches.length} matches loaded`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;