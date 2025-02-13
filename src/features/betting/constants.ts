export const USER_NAME_KEY = 'betting_app_user_name';

export const DEFAULT_SESSION: BettingSession = {
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
};