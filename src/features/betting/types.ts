import type { Bet, BetOption, BettingSession } from '@/types';

export interface MetaTags {
  title: string;
  description: string;
  image: string;
}

export interface BetLimits {
  min: number;
  max: number;
}

export interface BetValidation {
  isValid: boolean;
  error: string;
}