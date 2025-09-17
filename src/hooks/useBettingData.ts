import { useState, useEffect, useCallback, useRef } from 'react';
import { InPlayMatch, MarketState, MarketData, SubscriptionPayload, RestResponse } from '../types/betting';

const REST_ENDPOINT = 'https://directly-proud-occasional-self.trycloudflare.com/inplay-matches';

export const useBettingData = () => {
  const [matches, setMatches] = useState<InPlayMatch[]>([]);
  const [markets, setMarkets] = useState<Map<string, MarketState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionRef = useRef<SubscriptionPayload[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const lastUpdateRef = useRef<Map<string, Map<string, any>>>(new Map());

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(REST_ENDPOINT);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: RestResponse = await response.json();
      setMatches(data.inplay_matches);
      
      // Build subscription payload
      const subscription: SubscriptionPayload[] = [];
      data.inplay_matches.forEach(match => {
        match.markets.forEach(market => {
          subscription.push({
            marketId: market.marketId,
            eventId: match.id,
            applicationType: 'WEB'
          });
        });
      });
      
      subscriptionRef.current = subscription;
      
      // Connect to WebSocket if endpoints available
      if (data.wss_endpoints && data.wss_endpoints.length > 0) {
        connectWebSocket(data.wss_endpoints[0].url);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
      setLoading(false);
      
      // Retry with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      setTimeout(() => {
        reconnectAttemptsRef.current++;
        fetchMatches();
      }, retryDelay);
    }
  }, []);

  const connectWebSocket = useCallback((url: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        // Send subscription immediately
        if (subscriptionRef.current.length > 0) {
          const payload = JSON.stringify(subscriptionRef.current);
          const message = `[${JSON.stringify(payload)}]`;
          ws.send(message);
          console.log('Subscription sent:', message);
        }
      };

      ws.onmessage = (event) => {
        try {
          let data = event.data;
          
          // Handle different message formats
          if (typeof data === 'string') {
            // Strip leading 'a' if present
            if (data.startsWith('a')) {
              data = data.substring(1);
            }
            
            // Parse as JSON
            let parsed = JSON.parse(data);
            
            // If it's an array of strings, parse each string
            if (Array.isArray(parsed)) {
              parsed = parsed.map(item => {
                if (typeof item === 'string') {
                  try {
                    return JSON.parse(item);
                  } catch {
                    return item;
                  }
                }
                return item;
              }).filter(item => typeof item === 'object' && item !== null);
            }
            
            // Process market updates
            if (Array.isArray(parsed)) {
              parsed.forEach(processMarketUpdate);
            } else if (parsed && typeof parsed === 'object') {
              processMarketUpdate(parsed);
            }
          }
        } catch (err) {
          // Ignore parsing errors for non-JSON messages like single letters
          if (event.data.length > 10) {
            console.warn('Failed to parse WebSocket message:', err);
          }
        }
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectWebSocket(url);
        }, retryDelay + Math.random() * 1000); // Add jitter
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to connect to live updates');
      setConnectionStatus('disconnected');
    }
  }, []);

  const processMarketUpdate = useCallback((update: MarketData) => {
    if (!update.id) return;
    
    const marketId = update.id;
    
    setMarkets(prevMarkets => {
      const newMarkets = new Map(prevMarkets);
      const existingMarket = newMarkets.get(marketId);
      
      // Track changes for animations
      const marketChanges = new Map<string, any>();
      const lastMarketUpdate = lastUpdateRef.current.get(marketId) || new Map();
      
      // Create or update market state
      const marketState: MarketState = {
        ...update,
        runners: new Map(),
        lastUpdated: Date.now(),
        ...existingMarket, // Preserve existing fields
        ...update, // Override with new data
      };
      
      // Process runners
      if (update.rc) {
        update.rc.forEach(runner => {
          const runnerId = `${runner.id}-${runner.hc || 0}`;
          const existingRunner = existingMarket?.runners.get(runnerId);
          
          // Track odds changes for animations
          if (existingRunner) {
            // Compare bdatb (back) odds
            runner.bdatb.forEach((level, index) => {
              const existingLevel = existingRunner.bdatb[index];
              if (existingLevel && level.odds !== existingLevel.odds) {
                const changeKey = `${runnerId}-back-${index}`;
                marketChanges.set(changeKey, level.odds > existingLevel.odds ? 'up' : 'down');
              }
            });
            
            // Compare bdatl (lay) odds
            runner.bdatl.forEach((level, index) => {
              const existingLevel = existingRunner.bdatl[index];
              if (existingLevel && level.odds !== existingLevel.odds) {
                const changeKey = `${runnerId}-lay-${index}`;
                marketChanges.set(changeKey, level.odds > existingLevel.odds ? 'up' : 'down');
              }
            });
          }
          
          marketState.runners.set(runnerId, {
            ...existingRunner,
            ...runner,
          });
        });
      }
      
      // Store changes for animation triggers
      if (marketChanges.size > 0) {
        lastUpdateRef.current.set(marketId, marketChanges);
        // Clear changes after animation duration
        setTimeout(() => {
          const currentChanges = lastUpdateRef.current.get(marketId);
          if (currentChanges === marketChanges) {
            lastUpdateRef.current.delete(marketId);
          }
        }, 600);
      }
      
      newMarkets.set(marketId, marketState);
      return newMarkets;
    });
  }, []);

  const removeMarket = useCallback((marketId: string) => {
    setMarkets(prevMarkets => {
      const newMarkets = new Map(prevMarkets);
      newMarkets.delete(marketId);
      return newMarkets;
    });
  }, []);

  const getMarketChanges = useCallback((marketId: string) => {
    return lastUpdateRef.current.get(marketId) || new Map();
  }, []);

  useEffect(() => {
    fetchMatches();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchMatches]);

  return {
    matches,
    markets,
    loading,
    error,
    connectionStatus,
    getMarketChanges,
    removeMarket,
    refetch: fetchMatches,
  };
};
