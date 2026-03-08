export interface Driver {
  id: string;
  name: string;
  nationality: string;
  teamId: string;
  teamName: string;
  number: number;
  imageUrl: string;
}

export interface Team {
  id: string;
  name: string;
  nationality: string;
  logoUrl: string;
}

export enum EventType {
  QUALIFYING = 'Qualifying',
  SPRINT_QUALIFYING = 'Sprint Qualifying',
  SPRINT_RACE = 'Sprint Race',
  MAIN_RACE = 'Main Race',
  PRACTICE_1 = 'Practice 1',
  PRACTICE_2 = 'Practice 2',
  PRACTICE_3 = 'Practice 3',
}

export enum EventStatus {
  UPCOMING = 'Upcoming',
  LIVE = 'Live',
  FINISHED = 'Finished',
}

export interface Round {
  id: string;
  number: number;
  name: string;
  location: string;
  circuit: string;
}

export interface Event {
  id: string;
  roundId: string;
  type: EventType;
  date: Date;
  status: EventStatus;
  betValue: number;
  poolPrize: number;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  sender: string;
  type?: 'general' | 'invite';
  meta?: { leagueId: string; leagueName: string };
}

export interface LeaguePrize {
    title: string;
    imageUrl: string;
    rules: string;
}

export interface LeagueChatMessage {
    id: string;
    userId: string;
    username: string;
    avatarUrl: string;
    globalRank: number; // To highlight top players
    message: string;
    timestamp: Date;
    likes: string[]; // User IDs
    dislikes: string[]; // User IDs
}

export type MemberStatus = 'active' | 'suspended' | 'banned';

export interface League {
  id: string;
  name: string;
  description: string;
  adminId: string; // Creator
  isPrivate: boolean;
  inviteCode: string;
  members: string[]; // User IDs
  createdAt: Date;
  // New Features
  hasChat: boolean;
  prize?: LeaguePrize;
  messages: LeagueChatMessage[];
  memberStatus: Record<string, MemberStatus>; // userId -> status
}

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  balance: number;
  rank: number;
  points: number;
  password?: string;
  isAdmin?: boolean;
  age?: number;
  country?: string;
  location?: { lat: number; lng: number };
  timezone?: string;
  termsAccepted?: boolean;
  email?: string;
  phone?: string;
  notifications: Notification[];
  joinedLeagues: string[]; // IDs of leagues this user belongs to
}

export interface Bet {
  id: string;
  userId: string;
  eventId: string;
  predictions: Driver[]; // Ordered list of drivers
  teamPredictions: Team[]; // Ordered list of teams
  timestamp: Date;
  status: 'Active' | 'Settled' | 'Cancelled';
  lockedMultiplier: number;
}

export interface WinnerInfo {
  userId: string;
  username: string;
  prizeAmount: number;
  pointsEarned: number;
}

export interface Result {
  eventId: string;
  positions: Driver[]; // Ordered list of drivers
  winners: WinnerInfo[];
  totalPrizePool: number;
}

export interface ChatMessage {
  id: string;
  user: Pick<User, 'username' | 'avatarUrl'> & { isPundit?: boolean };
  message: string;
  timestamp: string;
}

export interface CoinPack {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
}

export interface AdSettings {
  googleAdClientId: string;
  rewardAmount: number;
  isEnabled: boolean;
}

export type AppTheme = 'original' | 'f1';

export interface TermsContent {
    en: string;
    pt: string;
    es: string;
}

export interface SystemSettings {
    theme: AppTheme;
    termsContent: TermsContent;
}