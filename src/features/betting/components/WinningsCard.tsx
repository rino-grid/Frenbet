import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';

interface WinningsCardProps {
  currentWinnings: number;
  visible: boolean;
}

export function WinningsCard({ currentWinnings, visible }: WinningsCardProps) {
  return (
    <Card
      className={cn(
        'bg-card/50 backdrop-blur-sm transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
        currentWinnings > 0 &&
          'bg-gradient-to-r from-emerald-500/20 to-blue-500/20'
      )}
    >
      <CardContent className="py-6">
        <h2 className="text-xl font-semibold mb-2">
          Your Total Potential Winnings
        </h2>
        <AnimatedNumber
          value={currentWinnings}
          prefix="$"
          className={cn(
            'text-3xl font-bold',
            currentWinnings > 0 && 'text-emerald-400'
          )}
        />
      </CardContent>
    </Card>
  );
}