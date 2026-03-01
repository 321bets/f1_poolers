
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Round, Event, Driver, User, Bet, Result, Team, Notification, League, CoinPack, AdSettings, LeaguePrize, MemberStatus, SystemSettings } from '../types';
import { dataService } from '../services/apiDataService';
import { useAuth } from './AuthContext';

interface DataContextType {
  rounds: Round[];
  events: Event[];
  drivers: Driver[];
  teams: Team[];
  users: User[];
  allBets: Bet[];
  results: Result[];
  leagues: League[];
  coinPacks: CoinPack[];
  adSettings: AdSettings;
  systemSettings: SystemSettings;
  createRound: (roundData: Omit<Round, 'id'>) => Promise<void>;
  updateRound: (roundData: Round) => Promise<void>;
  deleteRound: (roundId: string) => Promise<void>;
  createEvent: (eventData: Omit<Event, 'id' | 'poolPrize' | 'status'>) => Promise<void>;
  updateEvent: (eventData: Event) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  placeBet: (betData: Omit<Bet, 'id' | 'timestamp' | 'status' | 'lockedMultiplier'>) => Promise<{updatedUser: User, updatedEvent: Event}>;
  cancelBet: (betId: string) => Promise<void>;
  addResults: (resultData: Omit<Result, 'winners' | 'totalPrizePool'>) => Promise<void>;
  createTeam: (teamData: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (teamData: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  createDriver: (driverData: Omit<Driver, 'id' | 'teamName'>) => Promise<void>;
  updateDriver: (driverData: Omit<Driver, 'teamName'>) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  updateUser: (userData: Partial<User> & { id: string }) => Promise<void>;
  sendNotification: (target: { type: 'all' | 'user' | 'filter', userId?: string, criteria?: { minAge?: number, maxAge?: number, country?: string } }, message: string) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
  // League Methods
  createLeague: (name: string, description: string, isPrivate: boolean, hasChat: boolean, prize?: LeaguePrize) => Promise<void>;
  updateLeagueSettings: (leagueId: string, settings: { hasChat?: boolean, prize?: LeaguePrize }) => Promise<void>;
  joinLeague: (leagueId: string, code?: string) => Promise<void>;
  leaveLeague: (leagueId: string) => Promise<void>;
  inviteUserToLeague: (leagueId: string, username: string) => Promise<void>;
  sendLeagueMessage: (leagueId: string, message: string) => Promise<void>;
  reactToLeagueMessage: (leagueId: string, messageId: string, type: 'like' | 'dislike') => Promise<void>;
  moderateLeagueMember: (leagueId: string, targetUserId: string, action: MemberStatus | 'unsuspend') => Promise<void>;

  // Monetization
  updateAdSettings: (settings: AdSettings) => Promise<void>;
  createCoinPack: (pack: Omit<CoinPack, 'id'>) => Promise<void>;
  updateCoinPack: (pack: CoinPack) => Promise<void>;
  deleteCoinPack: (id: string) => Promise<void>;
  processAdReward: (userId: string) => Promise<void>;
  purchaseCoinPack: (userId: string, packId: string) => Promise<void>;

  // System
  updateSystemSettings: (settings: SystemSettings) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allBets, setAllBets] = useState<Bet[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [coinPacks, setCoinPacks] = useState<CoinPack[]>([]);
  const [adSettings, setAdSettings] = useState<AdSettings>({ googleAdClientId: '', rewardAmount: 0, isEnabled: false });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({ theme: 'original' });

  const { user, updateUser: updateAuthUser } = useAuth();

  const fetchData = useCallback(async () => {
    setRounds(await dataService.getRounds());
    setEvents(await dataService.getEvents());
    setDrivers(await dataService.getDrivers());
    setTeams(await dataService.getTeams());
    setUsers(await dataService.getUsers());
    setAllBets(await dataService.getAllBets());
    setResults(await dataService.getResults());
    setLeagues(await dataService.getLeagues());
    setCoinPacks(await dataService.getCoinPacks());
    setAdSettings(await dataService.getAdSettings());
    setSystemSettings(await dataService.getSystemSettings());
  }, []);

  useEffect(() => {
      if (user) {
          fetchData().then(async () => {
              const updated = await dataService.getUserById(user.id);
              if(updated) updateAuthUser(updated);
          });
      }
  }, [user?.id, updateAuthUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshCurrentUser = async () => {
    if (user) {
        const updated = await dataService.getUserById(user.id);
        if(updated) updateAuthUser(updated);
    }
  };

  const createRound = async (roundData: Omit<Round, 'id'>) => {
    await dataService.createRound(roundData);
    await fetchData();
    await refreshCurrentUser();
  };

  const updateRound = async (roundData: Round) => {
    await dataService.updateRound(roundData);
    fetchData();
  };

  const deleteRound = async (roundId: string) => {
    await dataService.deleteRound(roundId);
    fetchData();
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'poolPrize' | 'status'>) => {
    await dataService.createEvent(eventData);
    fetchData();
  };

  const updateEvent = async (eventData: Event) => {
    await dataService.updateEvent(eventData);
    fetchData();
  };

  const deleteEvent = async (eventId: string) => {
    await dataService.deleteEvent(eventId);
    fetchData();
  };
  
  const placeBet = async (betData: Omit<Bet, 'id' | 'timestamp' | 'status' | 'lockedMultiplier'>) => {
    const { updatedUser, updatedEvent } = await dataService.placeBet(betData);
    updateAuthUser(updatedUser);
    setEvents(prevEvents => prevEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    fetchData();
    return { updatedUser, updatedEvent };
  };

  const cancelBet = async (betId: string) => {
      await dataService.cancelBet(betId);
      await fetchData();
      await refreshCurrentUser();
  };

  const addResults = async (resultData: Omit<Result, 'winners' | 'totalPrizePool'>) => {
    await dataService.addResults(resultData);
    await fetchData();
    await refreshCurrentUser();
  };

  const createTeam = async (teamData: Omit<Team, 'id'>) => {
    await dataService.createTeam(teamData);
    fetchData();
  };

  const updateTeam = async (teamData: Team) => {
    await dataService.updateTeam(teamData);
    fetchData();
  };
  
  const deleteTeam = async (teamId: string) => {
    await dataService.deleteTeam(teamId);
    fetchData();
  };

  const createDriver = async (driverData: Omit<Driver, 'id' | 'teamName'>) => {
    await dataService.createDriver(driverData);
    fetchData();
  };

  const updateDriver = async (driverData: Omit<Driver, 'teamName'>) => {
    await dataService.updateDriver(driverData);
    fetchData();
  };

  const deleteDriver = async (driverId: string) => {
    await dataService.deleteDriver(driverId);
    fetchData();
  };

  const updateUser = async (userData: Partial<User> & { id: string }) => {
      await dataService.updateUser(userData);
      await fetchData();
      if (user && user.id === userData.id) {
          await refreshCurrentUser();
      }
  };

  const sendNotification = async (target: { type: 'all' | 'user' | 'filter', userId?: string, criteria?: { minAge?: number, maxAge?: number, country?: string } }, message: string) => {
      await dataService.sendNotification(target, message);
      await fetchData();
      await refreshCurrentUser();
  };

  const markNotificationRead = async (notifId: string) => {
      if (user) {
         const updatedUser = await dataService.markNotificationRead(user.id, notifId);
         updateAuthUser(updatedUser);
      }
  };

  // League Methods Implementation
  const createLeague = async (name: string, description: string, isPrivate: boolean, hasChat: boolean, prize?: LeaguePrize) => {
      if (!user) return;
      await dataService.createLeague(user.id, name, description, isPrivate, hasChat, prize);
      await fetchData();
      await refreshCurrentUser();
  };
  
  const updateLeagueSettings = async (leagueId: string, settings: { hasChat?: boolean, prize?: LeaguePrize }) => {
      await dataService.updateLeagueSettings(leagueId, settings);
      await fetchData();
  };

  const joinLeague = async (leagueId: string, code?: string) => {
      if (!user) return;
      await dataService.joinLeague(user.id, leagueId, code);
      await fetchData();
      await refreshCurrentUser();
  };

  const leaveLeague = async (leagueId: string) => {
      if (!user) return;
      await dataService.leaveLeague(user.id, leagueId);
      await fetchData();
      await refreshCurrentUser();
  };

  const inviteUserToLeague = async (leagueId: string, username: string) => {
      if (!user) return;
      await dataService.inviteUserToLeague(user.id, leagueId, username);
  };
  
  const sendLeagueMessage = async (leagueId: string, message: string) => {
      if (!user) return;
      await dataService.sendLeagueMessage(leagueId, user.id, message);
      await fetchData(); // Refresh to see message
  };
  
  const reactToLeagueMessage = async (leagueId: string, messageId: string, type: 'like' | 'dislike') => {
      if (!user) return;
      await dataService.reactToLeagueMessage(leagueId, messageId, user.id, type);
      await fetchData();
  };
  
  const moderateLeagueMember = async (leagueId: string, targetUserId: string, action: MemberStatus | 'unsuspend') => {
      if (!user) return;
      await dataService.moderateLeagueMember(leagueId, user.id, targetUserId, action);
      await fetchData();
  };
  
  // Monetization
  const updateAdSettings = async (settings: AdSettings) => {
      await dataService.updateAdSettings(settings);
      fetchData();
  };
  
  const createCoinPack = async (pack: Omit<CoinPack, 'id'>) => {
      await dataService.createCoinPack(pack);
      fetchData();
  };
  
  const updateCoinPack = async (pack: CoinPack) => {
      await dataService.updateCoinPack(pack);
      fetchData();
  };
  
  const deleteCoinPack = async (id: string) => {
      await dataService.deleteCoinPack(id);
      fetchData();
  };

  const processAdReward = async (userId: string) => {
      const updatedUser = await dataService.processAdReward(userId);
      updateAuthUser(updatedUser);
      fetchData();
  };

  const purchaseCoinPack = async (userId: string, packId: string) => {
      const updatedUser = await dataService.purchaseCoinPack(userId, packId);
      updateAuthUser(updatedUser);
      fetchData();
  };

  // System
  const updateSystemSettings = async (settings: SystemSettings) => {
      await dataService.updateSystemSettings(settings);
      setSystemSettings(settings);
  };

  const value = {
    rounds,
    events,
    drivers,
    teams,
    users,
    allBets,
    results,
    leagues,
    coinPacks,
    adSettings,
    systemSettings,
    createRound,
    updateRound,
    deleteRound,
    createEvent,
    updateEvent,
    deleteEvent,
    placeBet,
    cancelBet,
    addResults,
    createTeam,
    updateTeam,
    deleteTeam,
    createDriver,
    updateDriver,
    deleteDriver,
    updateUser,
    sendNotification,
    markNotificationRead,
    createLeague,
    updateLeagueSettings,
    joinLeague,
    leaveLeague,
    inviteUserToLeague,
    sendLeagueMessage,
    reactToLeagueMessage,
    moderateLeagueMember,
    updateAdSettings,
    createCoinPack,
    updateCoinPack,
    deleteCoinPack,
    processAdReward,
    purchaseCoinPack,
    updateSystemSettings
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
