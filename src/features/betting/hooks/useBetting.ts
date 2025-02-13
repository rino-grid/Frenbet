import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { BettingSession } from '@/types';
import type { BetLimits, BetValidation } from '../types';

export function useBetting(session: BettingSession, refreshSessionData: () => Promise<void>) {
  const [betAmount, setBetAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const getBetLimits = (): BetLimits => {
    if (!session.firstBetAmount) return { min: 0, max: Infinity };

    const min = (session.firstBetAmount * session.minBetPercentage) / 100;
    const max = (session.firstBetAmount * session.maxBetPercentage) / 100;

    return { min, max };
  };

  const validateBetAmount = (amount: number): BetValidation => {
    if (amount <= 0) return { isValid: false, error: 'Bet amount must be greater than 0' };
    if (!session.firstBetAmount) return { isValid: true, error: '' };

    const { min, max } = getBetLimits();
    if (amount < min) return { isValid: false, error: `Minimum bet amount is $${min}` };
    if (amount > max) return { isValid: false, error: `Maximum bet amount is $${max}` };
    return { isValid: true, error: '' };
  };

  const placeBet = async (optionIndex: number, playerName: string) => {
    const validation = validateBetAmount(betAmount);
    if (!playerName || !validation.isValid || !session.id) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('bets').insert({
        session_id: session.id,
        player_name: playerName,
        option_index: optionIndex,
        amount: betAmount,
      });

      if (error) throw error;

      await refreshSessionData();
      setBetAmount(0);
    } catch (error) {
      console.error('Error placing bet:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePotentialWin = (optionIndex: number) => {
    if (!betAmount) return 0;

    const option = session.options[optionIndex];
    const opposingOption = session.options[optionIndex === 0 ? 1 : 0];

    if (opposingOption.totalAmount === 0) {
      return 0;
    }

    const win =
      (betAmount / (option.totalAmount + betAmount)) *
      opposingOption.totalAmount;
    return Number(win.toFixed(2));
  };

  const calculateCurrentWinnings = (playerName: string) => {
    const winnings = session.options.reduce((total, option, index) => {
      const opposingOption = session.options[index === 0 ? 1 : 0];
      const myBet = option.bets.find((bet) => bet.playerName === playerName);

      if (!myBet || opposingOption.totalAmount === 0) {
        return total;
      }

      const win =
        (myBet.amount / option.totalAmount) * opposingOption.totalAmount;
      return total + Number(win.toFixed(2));
    }, 0);

    return winnings;
  };

  const calculateOdds = (optionIndex: number) => {
    const option = session.options[optionIndex];
    const opposingOption = session.options[optionIndex === 0 ? 1 : 0];

    if (option.totalAmount === 0 || opposingOption.totalAmount === 0) {
      return '---';
    }

    const odds = opposingOption.totalAmount / option.totalAmount;
    return `${odds.toFixed(2)}x`;
  };

  return {
    betAmount,
    setBetAmount,
    loading,
    getBetLimits,
    validateBetAmount,
    placeBet,
    calculatePotentialWin,
    calculateCurrentWinnings,
    calculateOdds,
  };
}