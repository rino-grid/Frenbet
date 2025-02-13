import React from 'react';
import { Loader2, Swords, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BettingSession } from '@/types';

interface CreateBetFormProps {
  session: BettingSession;
  setSession: (session: BettingSession) => void;
  playerName: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateBetForm({
  session,
  setSession,
  playerName,
  loading,
  onSubmit,
}: CreateBetFormProps) {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <Card className="backdrop-blur-sm bg-card/30">
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Create New Bet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="playerName" className="text-lg mb-4 block">
                Username
              </Label>
              <Input
                id="playerName"
                placeholder="Enter your username"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="title" className="text-lg mb-4 block">
                Bet Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Manchester United vs Liverpool"
                value={session.title}
                onChange={(e) =>
                  setSession((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-12 text-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="option1" className="text-lg mb-4 block">
                  Option 1
                </Label>
                <Input
                  id="option1"
                  placeholder="e.g., Man United Wins"
                  value={session.options[0].name}
                  onChange={(e) =>
                    setSession((prev) => ({
                      ...prev,
                      options: [
                        { ...prev.options[0], name: e.target.value },
                        prev.options[1],
                      ],
                    }))
                  }
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <Label htmlFor="option2" className="text-lg mb-4 block">
                  Option 2
                </Label>
                <Input
                  id="option2"
                  placeholder="e.g., Liverpool Wins"
                  value={session.options[1].name}
                  onChange={(e) =>
                    setSession((prev) => ({
                      ...prev,
                      options: [
                        prev.options[0],
                        { ...prev.options[1], name: e.target.value },
                      ],
                    }))
                  }
                  className="h-12 text-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between text-muted-foreground hover:text-primary p-0 h-auto font-normal"
              >
                <span className="text-sm">More Configurations</span>
                {showSettings ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Button>
              <div
                className={cn(
                  'grid transition-all',
                  showSettings ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="overflow-hidden">
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="minBet">
                        Minimum Bet (% of first bet)
                      </Label>
                      <Input
                        id="minBet"
                        type="number"
                        value={session.minBetPercentage}
                        onChange={(e) =>
                          setSession((prev) => ({
                            ...prev,
                            minBetPercentage: Math.max(
                              1,
                              Math.min(100, parseInt(e.target.value) || 50)
                            ),
                          }))
                        }
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxBet">
                        Maximum Bet (% of first bet)
                      </Label>
                      <Input
                        id="maxBet"
                        type="number"
                        value={session.maxBetPercentage}
                        onChange={(e) =>
                          setSession((prev) => ({
                            ...prev,
                            maxBetPercentage: Math.max(
                              100,
                              parseInt(e.target.value) || 200
                            ),
                          }))
                        }
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={
              loading ||
              !session.title ||
              !session.options[0].name ||
              !session.options[1].name ||
              !playerName
            }
            className="w-full h-12 text-lg"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Creating Bet...
              </>
            ) : (
              <>
                <Swords size={20} className="mr-2" />
                Create Bet
              </>
            )}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}