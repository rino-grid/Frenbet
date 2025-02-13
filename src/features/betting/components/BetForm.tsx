import React from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { BetLimits } from '../types';

interface BetFormProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  limits: BetLimits;
  error: string;
  showLimits: boolean;
}

export function BetForm({
  betAmount,
  setBetAmount,
  limits,
  error,
  showLimits,
}: BetFormProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <DollarSign
          size={20}
          className="absolute left-3 top-[14px] text-muted-foreground pointer-events-none"
        />
        <Input
          type="number"
          placeholder={
            showLimits
              ? `Enter bet amount ($${limits.min} - $${limits.max})`
              : 'Enter your bet amount'
          }
          value={betAmount || ''}
          onChange={(e) => {
            const value = e.target.value;
            setBetAmount(value === '' ? 0 : parseFloat(value));
          }}
          className={cn(
            'pl-10 h-12 text-lg font-bold',
            error && 'border-red-500 focus-visible:ring-red-500'
          )}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
      {showLimits && (
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBetAmount(limits.min)}
            className="flex-1"
          >
            Min (${limits.min})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBetAmount(limits.max)}
            className="flex-1"
          >
            Max (${limits.max})
          </Button>
        </div>
      )}
    </div>
  );
}