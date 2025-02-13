import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { BettingSession } from '@/types';
import { DEFAULT_SESSION } from '../constants';

export function useSession(id?: string) {
  const navigate = useNavigate();
  const [session, setSession] = useState<BettingSession>(DEFAULT_SESSION);
  const [loading, setLoading] = useState(false);

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

  const createGame = async (playerName: string) => {
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

  return {
    session,
    setSession,
    loading,
    refreshSessionData,
    createGame,
  };
}