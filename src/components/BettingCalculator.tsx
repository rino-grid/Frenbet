import React, { useState, useEffect } from 'react';
import {
  Share2,
  Swords,
  DollarSign,
  Loader2,
  Check,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Bet, BetOption, BettingSession } from '../types';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';

const USER_NAME_KEY = 'betting_app_user_name';

export default function BettingCalculator() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [session, setSession] = useState<BettingSession>({
    id: crypto.randomUUID(),
    title: '',
    options: [
      { id: crypto.randomUUID(), name: '', totalAmount: 0, bets: [] },
      { id: crypto.randomUUID(), name: '', totalAmount: 0, bets: [] },
    ],
    totalPool: 0,
    created: false,
    opId: '',
    slug: '',
    minBetPercentage: 50,
    maxBetPercentage: 200,
  });

  const [playerName, setPlayerName] = useState(() => {
    const savedName = localStorage.getItem(USER_NAME_KEY);
    return savedName || '';
  });

  const [isNameSubmitted, setIsNameSubmitted] = useState(() => {
    return !!localStorage.getItem(USER_NAME_KEY);
  });

  const [betAmount, setBetAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (id) {
      loadSharedBet(id);
    }
  }, [id]);

  useEffect(() => {
    if (!session.id || !session.created) return;

    const channel = supabase
      .channel('realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bets',
          filter: `session_id=eq.${session.id}`,
        },
        () => {
          refreshSessionData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'betting_sessions',
          filter: `id=eq.${session.id}`,
        },
        () => {
          refreshSessionData();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Subscription error:', err);
        } else {
          console.log('Subscription status:', status);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [session.id, session.created]);

  const refreshSessionData = async () => {
    if (!session.id) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('betting_sessions')
        .select('*')
        .eq('id', session.id)
        .single();

      if (sessionError) throw sessionError;

      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('session_id', session.id);

      if (betsError) throw betsError;

      if (sessionData && betsData) {
        const groupedBets = betsData.reduce((acc, bet) => {
          const key = `${bet.player_name}-${bet.option_index}`;
          if (!acc[key]) {
            acc[key] = {
              id: bet.id,
              playerName: bet.player_name,
              amount: 0,
              optionIndex: bet.option_index,
            };
          }
          acc[key].amount += Number(bet.amount);
          return acc;
        }, {} as Record<string, { id: string; playerName: string; amount: number; optionIndex: number }>);

        const option1Bets = Object.values(groupedBets)
          .filter((bet) => bet.optionIndex === 0)
          .map(({ id, playerName, amount }) => ({ id, playerName, amount }));

        const option2Bets = Object.values(groupedBets)
          .filter((bet) => bet.optionIndex === 1)
          .map(({ id, playerName, amount }) => ({ id, playerName, amount }));

        const firstBet = betsData[0];

        setSession((prev) => ({
          ...prev,
          title: sessionData.title,
          totalPool: Number(sessionData.total_pool) || 0,
          options: [
            {
              ...prev.options[0],
              name: sessionData.option1_name,
              totalAmount: option1Bets.reduce((sum, b) => sum + b.amount, 0),
              bets: option1Bets,
            },
            {
              ...prev.options[1],
              name: sessionData.option2_name,
              totalAmount: option2Bets.reduce((sum, b) => sum + b.amount, 0),
              bets: option2Bets,
            },
          ],
          minBetPercentage: sessionData.min_bet_percentage || 50,
          maxBetPercentage: sessionData.max_bet_percentage || 200,
          firstBetAmount: firstBet ? Number(firstBet.amount) : undefined,
        }));
      }
    } catch (error) {
      console.error('Error refreshing session data:', error);
    }
  };

  const loadSharedBet = async (slug: string) => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('betting_sessions')
        .select('*')
        .eq('slug', slug)
        .single();

      if (sessionError) throw sessionError;

      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('session_id', sessionData.id);

      if (betsError) throw betsError;

      const groupedBets = betsData.reduce((acc, bet) => {
        const key = `${bet.player_name}-${bet.option_index}`;
        if (!acc[key]) {
          acc[key] = {
            id: bet.id,
            playerName: bet.player_name,
            amount: 0,
            optionIndex: bet.option_index,
          };
        }
        acc[key].amount += Number(bet.amount);
        return acc;
      }, {} as Record<string, { id: string; playerName: string; amount: number; optionIndex: number }>);

      const option1Bets = Object.values(groupedBets)
        .filter((bet) => bet.optionIndex === 0)
        .map(({ id, playerName, amount }) => ({ id, playerName, amount }));

      const option2Bets = Object.values(groupedBets)
        .filter((bet) => bet.optionIndex === 1)
        .map(({ id, playerName, amount }) => ({ id, playerName, amount }));

      const firstBet = betsData[0];

      setSession({
        id: sessionData.id,
        title: sessionData.title,
        options: [
          {
            id: crypto.randomUUID(),
            name: sessionData.option1_name,
            totalAmount: option1Bets.reduce((sum, b) => sum + b.amount, 0),
            bets: option1Bets,
          },
          {
            id: crypto.randomUUID(),
            name: sessionData.option2_name,
            totalAmount: option2Bets.reduce((sum, b) => sum + b.amount, 0),
            bets: option2Bets,
          },
        ],
        totalPool: Number(sessionData.total_pool) || 0,
        created: true,
        opId: sessionData.op_name,
        slug: sessionData.slug,
        minBetPercentage: sessionData.min_bet_percentage || 50,
        maxBetPercentage: sessionData.max_bet_percentage || 200,
        firstBetAmount: firstBet ? Number(firstBet.amount) : undefined,
      });
    } catch (error) {
      console.error('Error loading shared bet:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !session.title ||
      !session.options[0].name ||
      !session.options[1].name ||
      !playerName
    )
      return;

    setLoading(true);
    const slug = Math.random().toString(36).substring(2, 15);

    try {
      const { data, error } = await supabase
        .from('betting_sessions')
        .insert({
          title: session.title,
          option1_name: session.options[0].name,
          option2_name: session.options[1].name,
          op_name: playerName,
          slug,
          min_bet_percentage: session.minBetPercentage,
          max_bet_percentage: session.maxBetPercentage,
        })
        .select()
        .single();

      if (error) throw error;

      setSession((prev) => ({
        ...prev,
        id: data.id,
        created: true,
        opId: playerName,
        slug: data.slug,
      }));

      navigate(`/bet/${data.slug}`, { replace: true });
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      localStorage.setItem(USER_NAME_KEY, playerName.trim());
      setIsNameSubmitted(true);
    }
  };

  const getBetLimits = () => {
    if (!session.firstBetAmount) return { min: 0, max: Infinity };

    const min = (session.firstBetAmount * session.minBetPercentage) / 100;
    const max = (session.firstBetAmount * session.maxBetPercentage) / 100;

    return { min, max };
  };

  const placeBet = async (optionIndex: number) => {
    if (!playerName || betAmount <= 0 || !session.id) return;

    const { min, max } = getBetLimits();
    if (session.firstBetAmount && (betAmount < min || betAmount > max)) {
      alert(`Bet amount must be between $${min} and $${max}`);
      return;
    }

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

  const calculateCurrentWinnings = () => {
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

  const shareLink = () => {
    const url = `${window.location.origin}/bet/${session.slug}`;
    navigator.clipboard.writeText(url);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  if (!session.created) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card className="backdrop-blur-sm bg-card/30">
          <form onSubmit={createGame}>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                Create New Bet
              </CardTitle>
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
      </div>
    );
  }

  const { min, max } = getBetLimits();
  const currentWinnings = calculateCurrentWinnings();
  const hasActiveBets = session.options.some((option) =>
    option.bets.some((bet) => bet.playerName === playerName)
  );

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <Card
        className={cn(
          'bg-card/50 backdrop-blur-sm transition-opacity duration-300',
          playerName && isNameSubmitted ? 'opacity-100' : 'opacity-0',
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

      <Card className="backdrop-blur-sm bg-card/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold">{session.title}</CardTitle>
          <Button
            variant="secondary"
            onClick={shareLink}
            className="bg-secondary/50 hover:bg-secondary/70"
          >
            {shareSuccess ? (
              <>
                <Check size={20} className="mr-2 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Share2 size={20} className="mr-2" />
                Share Bet
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {!playerName || !isNameSubmitted ? (
            <div className="py-4">
              <form onSubmit={handleNameSubmit} className="flex gap-4">
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
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <DollarSign
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="number"
                  placeholder={
                    session.firstBetAmount
                      ? `Enter bet amount ($${min} - $${max})`
                      : 'Enter your bet amount'
                  }
                  value={betAmount || ''}
                  onChange={(e) =>
                    setBetAmount(parseFloat(e.target.value) || 0)
                  }
                  className="pl-10 h-12 text-lg font-bold"
                />
              </div>
              {session.firstBetAmount && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(min)}
                    className="flex-1"
                  >
                    Min (${min})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(max)}
                    className="flex-1"
                  >
                    Max (${max})
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {session.options.map((option, index) => (
              <Card key={option.id} className="bg-card/50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{option.name}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      Current Odds: {calculateOdds(index)}
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
                          <span className="text-muted-foreground">
                            Potential win
                          </span>
                          <AnimatedNumber
                            value={calculatePotentialWin(index)}
                            prefix="$"
                            className="text-2xl font-bold"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button
                    onClick={() => placeBet(index)}
                    disabled={
                      !playerName || !isNameSubmitted || !betAmount || loading
                    }
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
