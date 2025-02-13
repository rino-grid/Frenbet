import React from 'react';
import { Share2, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { useSession } from '@/features/betting/hooks/useSession';
import { useBetting } from '@/features/betting/hooks/useBetting';
import { usePlayer } from '@/features/betting/hooks/usePlayer';
import { useShare } from '@/features/betting/hooks/useShare';
import { CreateBetForm } from '@/features/betting/components/CreateBetForm';
import { BetOption } from '@/features/betting/components/BetOption';
import { BetForm } from '@/features/betting/components/BetForm';
import { PlayerNameForm } from '@/features/betting/components/PlayerNameForm';
import { WinningsCard } from '@/features/betting/components/WinningsCard';

export default function BettingCalculator() {
  const { id } = useParams();
  const { session, setSession, loading: sessionLoading, refreshSessionData, createGame } = useSession(id);
  const {
    betAmount,
    setBetAmount,
    loading: bettingLoading,
    getBetLimits,
    validateBetAmount,
    placeBet,
    calculatePotentialWin,
    calculateCurrentWinnings,
    calculateOdds,
  } = useBetting(session, refreshSessionData);
  const { playerName, setPlayerName, isNameSubmitted, handleNameSubmit } = usePlayer();
  const { shareSuccess, shareLink, getMetaTags } = useShare(session, calculateOdds);

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    createGame(playerName);
  };

  const meta = getMetaTags();
  const limits = getBetLimits();
  const validation = betAmount ? validateBetAmount(betAmount) : { isValid: true, error: '' };
  const currentWinnings = calculateCurrentWinnings(playerName);

  if (!session.created) {
    return (
      <>
        <Helmet>
          <title>{meta.title}</title>
          <meta name="description" content={meta.description} />
          <meta property="og:title" content={meta.title} />
          <meta property="og:description" content={meta.description} />
          <meta property="og:image" content={meta.image} />
          <meta property="og:url" content={window.location.href} />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
        <div className="container max-w-2xl mx-auto p-6">
          <CreateBetForm
            session={session}
            setSession={setSession}
            playerName={playerName}
            loading={sessionLoading}
            onSubmit={handleCreateGame}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={meta.image} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <WinningsCard
          currentWinnings={currentWinnings}
          visible={playerName && isNameSubmitted}
        />

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
              <PlayerNameForm
                playerName={playerName}
                setPlayerName={setPlayerName}
                onSubmit={handleNameSubmit}
              />
            ) : (
              <BetForm
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                limits={limits}
                error={validation.error}
                showLimits={!!session.firstBetAmount}
              />
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {session.options.map((option, index) => (
                <BetOption
                  key={option.id}
                  option={option}
                  index={index}
                  odds={calculateOdds(index)}
                  betAmount={betAmount}
                  potentialWin={calculatePotentialWin(index)}
                  loading={bettingLoading}
                  playerName={playerName}
                  disabled={
                    !playerName ||
                    !isNameSubmitted ||
                    !betAmount ||
                    !validation.isValid ||
                    bettingLoading
                  }
                  onPlaceBet={() => placeBet(index, playerName)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}