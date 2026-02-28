import { User, Driver, Team, Round, Event, League, CoinPack, EventType, EventStatus } from '../types';

const API_URL = '/api';

// Helper function to map API event types to frontend enum
function mapEventType(apiType: string): EventType {
  const typeMap: { [key: string]: EventType } = {
    'practice': EventType.PRACTICE_1,
    'qualifying': EventType.QUALIFYING,
    'race': EventType.MAIN_RACE,
    'sprint': EventType.SPRINT_RACE
  };
  return typeMap[apiType.toLowerCase()] || EventType.PRACTICE_1;
}

// Helper function to map API event status to frontend enum
function mapEventStatus(apiStatus: string): EventStatus {
  const statusMap: { [key: string]: EventStatus } = {
    'upcoming': EventStatus.UPCOMING,
    'live': EventStatus.LIVE,
    'completed': EventStatus.FINISHED,
    'finished': EventStatus.FINISHED
  };
  return statusMap[apiStatus.toLowerCase()] || EventStatus.UPCOMING;
}

class DataService {
  // Users
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        console.error('Failed to fetch users:', response.status);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async findUserById(id: string): Promise<User | undefined> {
    try {
      const response = await fetch(`${API_URL}/users/${id}`);
      if (!response.ok) return undefined;
      return response.json();
    } catch {
      return undefined;
    }
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.getAllUsers();
    return users.find(u => u.username === username);
  }

  async updateUserBalance(userId: string, amount: number): Promise<void> {
    await fetch(`${API_URL}/users/${userId}/balance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
  }

  async updateUserPoints(userId: string, amount: number): Promise<void> {
    await fetch(`${API_URL}/users/${userId}/points`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
  }

  // Drivers
  async getAllDrivers(): Promise<Driver[]> {
    try {
      const response = await fetch(`${API_URL}/drivers`);
      if (!response.ok) {
        console.error('Failed to fetch drivers:', response.status);
        return [];
      }
      const drivers = await response.json();
      const teams = await this.getAllTeams();
      
      return drivers.map((driver: any) => ({
        ...driver,
        teamName: teams.find(t => t.id === driver.teamId)?.name || ''
      }));
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  }

  async getDriverById(id: string): Promise<Driver | undefined> {
    try {
      const response = await fetch(`${API_URL}/drivers/${id}`);
      if (!response.ok) return undefined;
      const driver = await response.json();
      const teams = await this.getAllTeams();
      return {
        ...driver,
        teamName: teams.find(t => t.id === driver.teamId)?.name || ''
      };
    } catch {
      return undefined;
    }
  }

  // Teams
  async getAllTeams(): Promise<Team[]> {
    try {
      const response = await fetch(`${API_URL}/teams`);
      if (!response.ok) {
        console.error('Failed to fetch teams:', response.status);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  // Leagues
  async getAllLeagues(): Promise<League[]> {
    const response = await fetch(`${API_URL}/leagues`);
    return response.json();
  }

  async getLeagueById(id: string): Promise<League | undefined> {
    try {
      const response = await fetch(`${API_URL}/leagues/${id}`);
      if (!response.ok) return undefined;
      return response.json();
    } catch {
      return undefined;
    }
  }

  // Rounds
  async getRounds(): Promise<Round[]> {
    try {
      const response = await fetch(`${API_URL}/rounds`);
      if (!response.ok) {
        console.error('Failed to fetch rounds:', response.status);
        return [];
      }
      const rounds = await response.json();
      return rounds.map((r: any) => ({
        id: r.id,
        name: r.name,
        number: r.roundNumber,
        circuit: r.location,
        location: r.country,
        startDate: r.startDate,
        endDate: r.endDate,
        country: r.country
      }));
    } catch (error) {
      console.error('Error fetching rounds:', error);
      return [];
    }
  }

  async getAllRounds(): Promise<Round[]> {
    return this.getRounds();
  }

  async getCurrentRound(): Promise<Round | undefined> {
    const rounds = await this.getRounds();
    const now = new Date();
    return rounds.find(r => new Date(r.startDate) <= now && new Date(r.endDate) >= now);
  }

  // Events
  async getEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${API_URL}/events`);
      if (!response.ok) {
        console.error('Failed to fetch events:', response.status);
        return [];
      }
      const events = await response.json();
      return events.map((e: any) => ({
        id: e.id,
        roundId: e.roundId,
        type: mapEventType(e.type),
        date: new Date(e.scheduledTime),
        status: mapEventStatus(e.status),
        betValue: e.betValue || 10,
        poolPrize: e.poolPrize || 0
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getAllEvents(): Promise<Event[]> {
    return this.getEvents();
  }

  // Bets
  async getAllBets(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/bets`);
      if (!response.ok) return [];
      const bets = await response.json();
      const drivers = await this.getAllDrivers();
      const teams = await this.getAllTeams();
      
      return bets.map((bet: any) => {
        // Convert prediction IDs to Driver objects
        const predictionIds = Array.isArray(bet.predictions) ? bet.predictions : [];
        const predictions = predictionIds.map((id: string) => {
          const driver = drivers.find(d => d.id === id);
          return driver || { id, name: id, teamName: '' };
        });
        
        // Convert team prediction IDs to Team objects
        const teamPredictionIds = Array.isArray(bet.teamPredictions) ? bet.teamPredictions : [];
        const teamPredictions = teamPredictionIds.map((id: string) => {
          const team = teams.find(t => t.id === id);
          return team || { id, name: id };
        });
        
        return {
          ...bet,
          timestamp: new Date(bet.timestamp || bet.placedAt),
          predictions,
          teamPredictions
        };
      });
    } catch (error) {
      console.error('Error fetching bets:', error);
      return [];
    }
  }

  async getResults(): Promise<any[]> {
    const response = await fetch(`${API_URL}/results`);
    return response.json();
  }

  // Alias methods for compatibility
  async getUsers(): Promise<User[]> {
    return this.getAllUsers();
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.findUserById(id);
  }

  async getDrivers(): Promise<Driver[]> {
    return this.getAllDrivers();
  }

  async getTeams(): Promise<Team[]> {
    return this.getAllTeams();
  }

  async getLeagues(): Promise<League[]> {
    return this.getAllLeagues();
  }

  async placeBet(betData: any): Promise<{ updatedUser: User; updatedEvent: Event }> {
    // Determine if it's a combo bet (has both drivers and teams)
    const isCombo = betData.predictions.length > 0 && betData.teamPredictions?.length > 0;
    
    const response = await fetch(`${API_URL}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: betData.userId,
        eventId: betData.eventId,
        predictions: betData.predictions.map((d: any) => d.id),
        teamPredictions: betData.teamPredictions?.map((t: any) => t.id) || [],
        lockedMultiplier: betData.lockedMultiplier || 1,
        isCombo: isCombo
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to place bet');
    }
    
    // Fetch updated user and event
    const updatedUser = await this.findUserById(betData.userId);
    const events = await this.getEvents();
    const updatedEvent = events.find(e => e.id === betData.eventId);
    
    if (!updatedUser || !updatedEvent) {
      throw new Error('Failed to get updated data');
    }
    
    return { updatedUser, updatedEvent };
  }

  async cancelBet(betId: string): Promise<void> {
    const response = await fetch(`${API_URL}/bets/${betId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel bet');
    }
  }

  async getCoinPacks(): Promise<CoinPack[]> {
    return [
      { id: 'pack1', name: 'Starter Kit', coins: 100, price: 0.99, currency: 'USD' },
      { id: 'pack2', name: 'Racer Bundle', coins: 550, price: 4.99, currency: 'USD' },
      { id: 'pack3', name: 'Podium Stash', coins: 1200, price: 9.99, currency: 'USD' },
      { id: 'pack4', name: 'Championship Vault', coins: 3000, price: 24.99, currency: 'USD' }
    ];
  }

  async getAdSettings(): Promise<any> {
    return { googleAdClientId: '', rewardAmount: 0, isEnabled: false };
  }

  async getSystemSettings(): Promise<any> {
    return { theme: 'original', termsContent: `F1™ POOLERS - TERMS AND CONDITIONS

Last Updated: February 2026

1. ACCEPTANCE OF TERMS
By accessing or using F1™ Poolers, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this platform.

2. NO OFFICIAL AFFILIATION
F1™ Poolers is NOT officially affiliated with, endorsed by, or connected to Formula 1, the FIA, any F1 teams, or any F1 drivers. F1, FORMULA 1, F1 logo, and related marks are trademarks of Formula One Licensing BV. This is an independent fan-made platform for entertainment purposes only.

3. FREE SERVICE
F1™ Poolers is completely free to use. No payment is required to access or participate in the platform.

4. NO CASH PRIZES
F1™ Poolers does NOT pay out any cash prizes, monetary rewards, or real-world compensation of any kind. All coins and points within the platform are virtual and have no real-world monetary value. They cannot be withdrawn, exchanged for cash, or used to purchase physical goods.

5. USER-CREATED LEAGUES AND PRIZES
Users may create and manage private leagues. Any prizes, rewards, or stakes offered by league creators or administrators are the sole responsibility of those individuals. F1™ Poolers is NOT responsible for any prizes offered, promised, or distributed within user-created leagues. We shall not be held liable for any disputes, non-delivery, or issues arising from league-specific prizes.

6. RACE RESULTS AND OFFICIAL STANDINGS
Race results will be posted by F1™ Poolers administrators within 2 (two) hours after the official end of each event. These posted results are final and official for the purposes of this platform. Any penalties, disqualifications, or changes to driver/team standings that occur after this 2-hour window will NOT affect the results on F1™ Poolers. Court decisions, appeals, or any legal proceedings related to race results will NOT impact standings within this platform.

7. CHAT AND USER-GENERATED CONTENT
F1™ Poolers administrators are NOT responsible for the content of messages sent by users in chat features, league chats, or any other communication channels within the platform. Users are solely responsible for their own messages and must maintain respectful conduct.

8. ELIGIBILITY
You must be at least 18 years of age to use this platform.

9. USER CONDUCT
Users must maintain sporting and respectful conduct at all times. We reserve the right to suspend or permanently ban accounts for abusive, offensive, or inappropriate behavior.

10. INTELLECTUAL PROPERTY
All car liveries, driver photos, and team logos used in this application are for illustrative purposes only and remain the property of their respective copyright holders.

11. LIMITATION OF LIABILITY
F1™ Poolers is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of this platform.

12. CHANGES TO TERMS
We reserve the right to modify these Terms and Conditions at any time. Continued use of the platform constitutes acceptance of any changes.

By using F1™ Poolers, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.` };
  }

  async updateSystemSettings(settings: any): Promise<void> {
    // For now, just log - settings would be saved to database in full implementation
    console.log('Updating system settings:', settings);
  }

  async updateAdSettings(settings: any): Promise<void> {
    console.log('Updating ad settings:', settings);
  }
}

export const dataService = new DataService();
