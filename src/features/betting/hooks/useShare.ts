import { useState } from 'react';
import type { BettingSession } from '@/types';
import type { MetaTags } from '../types';

export function useShare(session: BettingSession, calculateOdds: (index: number) => string) {
  const [shareSuccess, setShareSuccess] = useState(false);

  const shareLink = () => {
    const url = `${window.location.origin}/bet/${session.slug}`;
    navigator.clipboard.writeText(url);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const getMetaTags = (): MetaTags => {
    if (!session.created) {
      return {
        title: 'Frenbet - Create a New Bet',
        description: 'Create and share friendly bets with your friends',
        image: `${window.location.origin}/api/og?type=home`,
      };
    }

    const odds1 = calculateOdds(0);
    const odds2 = calculateOdds(1);
    
    return {
      title: `${session.title} | Frenbet`,
      description: `${session.options[0].name} (${odds1}) vs ${session.options[1].name} (${odds2}) - Total Pool: $${session.totalPool}`,
      image: `${window.location.origin}/api/og?title=${encodeURIComponent(session.title)}&option1=${encodeURIComponent(session.options[0].name)}&option2=${encodeURIComponent(session.options[1].name)}&odds1=${encodeURIComponent(odds1)}&odds2=${encodeURIComponent(odds2)}&pool=${session.totalPool}`,
    };
  };

  return {
    shareSuccess,
    shareLink,
    getMetaTags,
  };
}