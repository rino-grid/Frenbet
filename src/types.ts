export interface BetOption {
  id: string;
  name: string;
  totalAmount: number;
  bets: Bet[];
}

export interface Bet {
  id: string;
  amount: number;
  playerName: string;
}

export interface BettingSession {
  id: string;
  title: string;
  options: [BetOption, BetOption];
  totalPool: number;
  winner?: string;
  created: boolean;
  opId: string;
  slug?: string;
  minBetPercentage: number;
  maxBetPercentage: number;
  firstBetAmount?: number;
}