export interface InPlayMatch {
  id: string;
  name: string;
  sport: string;
  openDate: string;
  markets: Market[];
}

export interface Market {
  marketId: string;
  marketName: string;
}

export interface SubscriptionPayload {
  marketId: string;
  eventId: string;
  applicationType: 'WEB';
}

export interface MarketDefinition {
  marketType: string;
  inPlay: boolean;
}

export interface Runner {
  id: string;
  hc?: number;
  tv?: number;
  bdatb: PriceLevel[];
  bdatl: PriceLevel[];
  locked?: boolean;
}

export interface PriceLevel {
  index: number;
  odds: number;
  amount: number;
}

export interface MarketData {
  id: string;
  marketDefinition?: MarketDefinition;
  rc: Runner[];
  mainEventId: string;
  mainEventName: string;
  mainEventStartTime: number;
  marketNameWithParents: string;
  status: 'OPEN' | 'SUSPENDED';
  img?: boolean;
  bettingEnabled?: boolean;
  currency: string;
}

export interface MarketState extends MarketData {
  runners: Map<string, Runner>;
  lastUpdated: number;
}

export interface RestResponse {
  inplay_matches: InPlayMatch[];
  wss_endpoints: Array<{ url: string }>;
}