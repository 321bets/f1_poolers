import type { User, Driver, Team, Round, Event, Bet, Result, League, CoinPack, AdSettings, LeaguePrize, LeagueChatMessage, MemberStatus, SystemSettings } from '../types';

const API_BASE = '/api';

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

function fixDates(event: any): Event {
  return { ...event, date: new Date(event.date) };
}

function fixBetDates(bet: any): Bet {
  return { ...bet, timestamp: new Date(bet.timestamp) };
}

function fixNotifDates(user: any): User {
  if (user.notifications) {
    user.notifications = user.notifications.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp)
    }));
  }
  return user;
}

function fixLeagueDates(league: any): League {
  return {
    ...league,
    createdAt: new Date(league.createdAt),
    messages: (league.messages || []).map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }))
  };
}

export const dataService = {
  // READ
  getUsers: async (): Promise<User[]> => {
    const users = await fetchJson('/users');
    return users.map(fixNotifDates);
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    try {
      const user = await fetchJson(`/users/${id}`);
      return fixNotifDates(user);
    } catch {
      return undefined;
    }
  },

  findUserByUsername: async (username: string): Promise<User | undefined> => {
    try {
      const user = await fetchJson(`/users/by-username/${encodeURIComponent(username)}`);
      return fixNotifDates(user);
    } catch {
      return undefined;
    }
  },

  getDrivers: async (): Promise<Driver[]> => {
    return fetchJson('/drivers');
  },

  getTeams: async (): Promise<Team[]> => {
    return fetchJson('/teams');
  },

  getRounds: async (): Promise<Round[]> => {
    return fetchJson('/rounds');
  },

  getEvents: async (): Promise<Event[]> => {
    const events = await fetchJson('/events');
    return events.map(fixDates);
  },

  getBetsForUser: async (userId: string): Promise<Bet[]> => {
    const bets = await fetchJson(`/bets?userId=${userId}`);
    return bets.map(fixBetDates);
  },

  getAllBets: async (): Promise<Bet[]> => {
    const bets = await fetchJson('/bets');
    return bets.map(fixBetDates);
  },

  getResults: async (): Promise<Result[]> => {
    return fetchJson('/results');
  },

  getLeagues: async (): Promise<League[]> => {
    const leagues = await fetchJson('/leagues');
    return leagues.map(fixLeagueDates);
  },

  getCoinPacks: async (): Promise<CoinPack[]> => {
    return fetchJson('/settings/coin-packs');
  },

  getAdSettings: async (): Promise<AdSettings> => {
    return fetchJson('/settings/ad-settings');
  },

  getSystemSettings: async (): Promise<SystemSettings> => {
    return fetchJson('/settings/system');
  },

  // WRITE
  createUser: async (username: string, password_raw: string, age: number, country: string, location?: {lat: number, lng: number}, timezone?: string): Promise<User> => {
    const user = await fetchJson('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password: password_raw, age, country, location, timezone })
    });
    return fixNotifDates(user);
  },

  updateUser: async (userData: Partial<User> & { id: string }): Promise<User> => {
    const user = await fetchJson(`/users/${userData.id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
    return fixNotifDates(user);
  },

  // League Methods
  createLeague: async (userId: string, name: string, description: string, isPrivate: boolean, hasChat: boolean, prize?: LeaguePrize): Promise<League> => {
    await fetchJson('/leagues', {
      method: 'POST',
      body: JSON.stringify({ userId, name, description, isPrivate, hasChat, prize })
    });
    const leagues = await fetchJson('/leagues');
    return fixLeagueDates(leagues[leagues.length - 1]);
  },

  updateLeagueSettings: async (leagueId: string, settings: { hasChat?: boolean, prize?: LeaguePrize }): Promise<void> => {
    await fetchJson(`/leagues/${leagueId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  joinLeague: async (userId: string, leagueId: string, code?: string): Promise<League> => {
    await fetchJson(`/leagues/${leagueId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId, code })
    });
    const leagues = await fetchJson('/leagues');
    return fixLeagueDates(leagues.find((l: any) => l.id === leagueId));
  },

  leaveLeague: async (userId: string, leagueId: string): Promise<void> => {
    await fetchJson(`/leagues/${leagueId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  inviteUserToLeague: async (adminId: string, leagueId: string, targetUsername: string): Promise<void> => {
    await fetchJson(`/leagues/${leagueId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ adminId, targetUsername })
    });
  },

  sendLeagueMessage: async (leagueId: string, userId: string, message: string): Promise<LeagueChatMessage> => {
    const result = await fetchJson(`/leagues/${leagueId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ userId, message })
    });
    return result;
  },

  reactToLeagueMessage: async (leagueId: string, messageId: string, userId: string, type: 'like' | 'dislike'): Promise<void> => {
    await fetchJson(`/leagues/${leagueId}/messages/${messageId}/react`, {
      method: 'POST',
      body: JSON.stringify({ userId, type })
    });
  },

  moderateLeagueMember: async (leagueId: string, adminId: string, targetUserId: string, action: MemberStatus | 'unsuspend'): Promise<void> => {
    await fetchJson(`/leagues/${leagueId}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ adminId, targetUserId, action })
    });
  },

  createRound: async (roundData: Omit<Round, 'id'>): Promise<Round> => {
    return fetchJson('/rounds', {
      method: 'POST',
      body: JSON.stringify(roundData)
    });
  },

  updateRound: async (roundData: Round): Promise<Round> => {
    return fetchJson(`/rounds/${roundData.id}`, {
      method: 'PUT',
      body: JSON.stringify(roundData)
    });
  },

  deleteRound: async (roundId: string): Promise<void> => {
    await fetchJson(`/rounds/${roundId}`, { method: 'DELETE' });
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'poolPrize' | 'status'>): Promise<Event> => {
    const event = await fetchJson('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    return fixDates(event);
  },

  updateEvent: async (eventData: Event): Promise<Event> => {
    const event = await fetchJson(`/events/${eventData.id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
    return fixDates(event);
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await fetchJson(`/events/${eventId}`, { method: 'DELETE' });
  },

  createTeam: async (teamData: Omit<Team, 'id'>): Promise<Team> => {
    return fetchJson('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  },

  updateTeam: async (teamData: Team): Promise<Team> => {
    return fetchJson(`/teams/${teamData.id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData)
    });
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    await fetchJson(`/teams/${teamId}`, { method: 'DELETE' });
  },

  createDriver: async (driverData: Omit<Driver, 'id' | 'teamName'>): Promise<Driver> => {
    return fetchJson('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData)
    });
  },

  updateDriver: async (driverData: Omit<Driver, 'teamName'>): Promise<Driver> => {
    return fetchJson(`/drivers/${driverData.id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData)
    });
  },

  deleteDriver: async (driverId: string): Promise<void> => {
    await fetchJson(`/drivers/${driverId}`, { method: 'DELETE' });
  },

  placeBet: async (betData: Omit<Bet, 'id' | 'timestamp' | 'status' | 'lockedMultiplier'>): Promise<{updatedUser: User, updatedEvent: Event}> => {
    const result = await fetchJson('/bets', {
      method: 'POST',
      body: JSON.stringify(betData)
    });
    return {
      updatedUser: fixNotifDates(result.updatedUser),
      updatedEvent: fixDates(result.updatedEvent)
    };
  },

  cancelBet: async (betId: string): Promise<void> => {
    await fetchJson(`/bets/${betId}`, { method: 'DELETE' });
  },

  sendNotification: async (target: { type: 'all' | 'user' | 'filter', userId?: string, criteria?: { minAge?: number, maxAge?: number, country?: string } }, message: string): Promise<void> => {
    await fetchJson('/users/notifications/send', {
      method: 'POST',
      body: JSON.stringify({ target, message })
    });
  },

  markNotificationRead: async (userId: string, notifId: string): Promise<User> => {
    const user = await fetchJson(`/users/${userId}/notifications/${notifId}/read`, {
      method: 'PATCH'
    });
    return fixNotifDates(user);
  },

  addResults: async (resultData: Omit<Result, 'winners' | 'totalPrizePool'>): Promise<void> => {
    await fetchJson('/results', {
      method: 'POST',
      body: JSON.stringify(resultData)
    });
  },

  // Monetization
  updateAdSettings: async (settings: AdSettings): Promise<void> => {
    await fetchJson('/settings/ad-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  createCoinPack: async (pack: Omit<CoinPack, 'id'>): Promise<CoinPack> => {
    return fetchJson('/settings/coin-packs', {
      method: 'POST',
      body: JSON.stringify(pack)
    });
  },

  updateCoinPack: async (pack: CoinPack): Promise<void> => {
    await fetchJson(`/settings/coin-packs/${pack.id}`, {
      method: 'PUT',
      body: JSON.stringify(pack)
    });
  },

  deleteCoinPack: async (id: string): Promise<void> => {
    await fetchJson(`/settings/coin-packs/${id}`, { method: 'DELETE' });
  },

  processAdReward: async (userId: string): Promise<User> => {
    const user = await fetchJson('/settings/ad-reward', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    return fixNotifDates(user);
  },

  purchaseCoinPack: async (userId: string, packId: string): Promise<User> => {
    const user = await fetchJson('/settings/purchase-pack', {
      method: 'POST',
      body: JSON.stringify({ userId, packId })
    });
    return fixNotifDates(user);
  },

  updateSystemSettings: async (settings: SystemSettings): Promise<void> => {
    await fetchJson('/settings/system', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};
