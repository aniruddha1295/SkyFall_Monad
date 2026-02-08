export interface Market {
  id: number;
  city: string;
  condition: WeatherCondition;
  operator: Operator;
  threshold: bigint;
  resolutionTime: bigint;
  createdAt: bigint;
  totalYesPool: bigint;
  totalNoPool: bigint;
  status: MarketStatus;
  outcome: boolean;
  creator: string;
}

export enum WeatherCondition {
  RAINFALL = 0,
  TEMPERATURE = 1,
  WIND_SPEED = 2,
}

export enum Operator {
  ABOVE = 0,
  BELOW = 1,
}

export enum MarketStatus {
  OPEN = 0,
  RESOLVED = 1,
  CANCELLED = 2,
}

export interface Bet {
  amount: bigint;
  isYes: boolean;
  claimed: boolean;
}

export interface WeatherData {
  temp: number;
  rainfall: number;
  windSpeed: number;
  humidity: number;
  condition: string;
  icon: string;
  cityName: string;
}

export interface WalletState {
  address: string | null;
  balance: string | null;
  signer: any | null;
  provider: any | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
}
