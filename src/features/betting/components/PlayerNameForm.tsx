import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PlayerNameFormProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PlayerNameForm({
  playerName,
  setPlayerName,
  onSubmit,
}: PlayerNameFormProps) {
  return (
    <div className="py-4">
      <form onSubmit={onSubmit} className="flex gap-4">
        <div className="relative flex-1">
          <User
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Enter your username to place a bet"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
        <Button
          type="submit"
          disabled={!playerName.trim()}
          className="h-12 px-8"
        >
          Continue
        </Button>
      </form>
    </div>
  );
}