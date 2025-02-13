import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';
import type { BetOption as BetOptionType } from '@/types';

interface BetOptionProps {
  option: BetOptionType;
  index: number;
  odds: string;
  betAmount: number;
  potentialWin: number;
  loading: boolean;
  playerName: string;
  disabled: boolean;
  onPlaceBet: () => void;
}

export function BetOption({
  option,
  index,
  odds,
  betAmount,
  potentialWin,
  loading,
  playerName,
  disabled,
  onPlaceBet,
}: BetOptionProps) {
  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{option.name}</CardTitle>
          <span className="text-sm text-muted-foreground">
            Current Odds: {odds}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            'transition-all duration-300',
            betAmount > 0
              ? 'opacity-100 h-[76px]'
              : 'opacity-0 h-0 overflow-hidden'
          )}
        >
          <Card className="bg-card/30">
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Potential win</span>
                <AnimatedNumber
                  value={potentialWin}
                  prefix="$"
                  className="text-2xl font-bold"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={onPlaceBet}
          disabled={disabled}
          className="w-full h-12"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Placing Bet...
            </>
          ) : (
            <>Place Bet on {option.name}</>
          )}
        </Button>

        {option.bets.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Current Bets
            </h3>
            <div className="space-y-1">
              {option.bets.map((bet) => (
                <div
                  key={bet.id}
                  className="flex justify-between items-center text-sm bg-card/30 p-2 rounded-md"
                >
                  <span className="flex items-center gap-2">
                    {bet.playerName}
                    {bet.playerName === playerName && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </span>
                  <AnimatedNumber value={bet.amount} prefix="$" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}