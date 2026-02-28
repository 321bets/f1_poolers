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

  async createRound(roundData: Omit<Round, 'id'>): Promise<Round> {
    const response = await fetch(`${API_URL}/rounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roundData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create round');
    }
    return response.json();
  }

  async updateRound(roundData: Round): Promise<Round> {
    const response = await fetch(`${API_URL}/rounds/${roundData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roundData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update round');
    }
    return response.json();
  }

  async deleteRound(roundId: string): Promise<void> {
    const response = await fetch(`${API_URL}/rounds/${roundId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete round');
    }
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

  async createEvent(eventData: Omit<Event, 'id' | 'poolPrize' | 'status'>): Promise<Event> {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create event');
    }
    return response.json();
  }

  async updateEvent(eventData: Event): Promise<Event> {
    const response = await fetch(`${API_URL}/events/${eventData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }
    return response.json();
  }

  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete event');
    }
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
    return { theme: 'original', termsContent: {
      en: `F1™ POOLERS - TERMS AND CONDITIONS

Last Updated: February 2026

1. ACCEPTANCE OF TERMS
By accessing or using F1™ Poolers, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this platform.

2. NO OFFICIAL AFFILIATION & TRADEMARK NOTICE
F1™ Poolers is NOT officially affiliated with, endorsed by, or connected to Formula 1, the FIA, any F1 teams, or any F1 drivers. "F1", "Formula 1", "Formula One", the F1 logo, and all related marks are registered trademarks of Formula One Licensing BV and are NOT owned by F1™ Poolers. These trademarks are used for informational and fan entertainment purposes only. This is an independent fan-made platform for entertainment purposes only.

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

By using F1™ Poolers, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.`,

      pt: `F1™ POOLERS - TERMOS E CONDIÇÕES

Última Atualização: Fevereiro de 2026

1. ACEITAÇÃO DOS TERMOS
Ao acessar ou usar o F1™ Poolers, você concorda em estar vinculado a estes Termos e Condições. Se você não concordar com estes termos, por favor não use esta plataforma.

2. SEM AFILIAÇÃO OFICIAL E AVISO DE MARCA REGISTRADA
O F1™ Poolers NÃO é oficialmente afiliado, endossado ou conectado à Formula 1, FIA, qualquer equipe de F1 ou qualquer piloto de F1. "F1", "Formula 1", "Formula One", o logotipo da F1 e todas as marcas relacionadas são marcas registradas da Formula One Licensing BV e NÃO são de propriedade do F1™ Poolers. Essas marcas são usadas apenas para fins informativos e de entretenimento de fãs. Esta é uma plataforma independente feita por fãs apenas para fins de entretenimento.

3. SERVIÇO GRATUITO
O F1™ Poolers é completamente gratuito. Nenhum pagamento é necessário para acessar ou participar da plataforma.

4. SEM PRÊMIOS EM DINHEIRO
O F1™ Poolers NÃO paga prêmios em dinheiro, recompensas monetárias ou compensação real de qualquer tipo. Todas as moedas e pontos dentro da plataforma são virtuais e não têm valor monetário real. Eles não podem ser sacados, trocados por dinheiro ou usados para comprar bens físicos.

5. LIGAS CRIADAS POR USUÁRIOS E PRÊMIOS
Os usuários podem criar e gerenciar ligas privadas. Quaisquer prêmios, recompensas ou apostas oferecidas por criadores ou administradores de ligas são de responsabilidade exclusiva desses indivíduos. O F1™ Poolers NÃO é responsável por quaisquer prêmios oferecidos, prometidos ou distribuídos dentro de ligas criadas por usuários. Não seremos responsabilizados por quaisquer disputas, não entrega ou problemas decorrentes de prêmios específicos da liga.

6. RESULTADOS DE CORRIDAS E CLASSIFICAÇÕES OFICIAIS
Os resultados das corridas serão publicados pelos administradores do F1™ Poolers dentro de 2 (duas) horas após o término oficial de cada evento. Esses resultados publicados são finais e oficiais para os propósitos desta plataforma. Quaisquer penalidades, desqualificações ou alterações nas classificações de pilotos/equipes que ocorram após esta janela de 2 horas NÃO afetarão os resultados no F1™ Poolers. Decisões judiciais, recursos ou quaisquer procedimentos legais relacionados aos resultados das corridas NÃO impactarão as classificações dentro desta plataforma.

7. CHAT E CONTEÚDO GERADO POR USUÁRIOS
Os administradores do F1™ Poolers NÃO são responsáveis pelo conteúdo das mensagens enviadas pelos usuários em recursos de chat, chats de liga ou quaisquer outros canais de comunicação dentro da plataforma. Os usuários são os únicos responsáveis por suas próprias mensagens e devem manter uma conduta respeitosa.

8. ELEGIBILIDADE
Você deve ter pelo menos 18 anos de idade para usar esta plataforma.

9. CONDUTA DO USUÁRIO
Os usuários devem manter uma conduta esportiva e respeitosa em todos os momentos. Reservamo-nos o direito de suspender ou banir permanentemente contas por comportamento abusivo, ofensivo ou inadequado.

10. PROPRIEDADE INTELECTUAL
Todas as pinturas de carros, fotos de pilotos e logotipos de equipes usados neste aplicativo são apenas para fins ilustrativos e permanecem propriedade de seus respectivos detentores de direitos autorais.

11. LIMITAÇÃO DE RESPONSABILIDADE
O F1™ Poolers é fornecido "como está" sem garantias de qualquer tipo. Não somos responsáveis por quaisquer danos decorrentes do uso desta plataforma.

12. ALTERAÇÕES NOS TERMOS
Reservamo-nos o direito de modificar estes Termos e Condições a qualquer momento. O uso continuado da plataforma constitui aceitação de quaisquer alterações.

Ao usar o F1™ Poolers, você reconhece que leu, entendeu e concorda em estar vinculado a estes Termos e Condições.`,

      es: `F1™ POOLERS - TÉRMINOS Y CONDICIONES

Última Actualización: Febrero de 2026

1. ACEPTACIÓN DE LOS TÉRMINOS
Al acceder o usar F1™ Poolers, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con estos términos, por favor no use esta plataforma.

2. SIN AFILIACIÓN OFICIAL Y AVISO DE MARCA REGISTRADA
F1™ Poolers NO está oficialmente afiliado, respaldado ni conectado con Formula 1, la FIA, ningún equipo de F1 ni ningún piloto de F1. "F1", "Formula 1", "Formula One", el logotipo de F1 y todas las marcas relacionadas son marcas registradas de Formula One Licensing BV y NO son propiedad de F1™ Poolers. Estas marcas se utilizan únicamente con fines informativos y de entretenimiento para fans. Esta es una plataforma independiente hecha por fans solo con fines de entretenimiento.

3. SERVICIO GRATUITO
F1™ Poolers es completamente gratis. No se requiere ningún pago para acceder o participar en la plataforma.

4. SIN PREMIOS EN EFECTIVO
F1™ Poolers NO paga premios en efectivo, recompensas monetarias ni compensación real de ningún tipo. Todas las monedas y puntos dentro de la plataforma son virtuales y no tienen valor monetario real. No pueden ser retirados, cambiados por dinero ni utilizados para comprar bienes físicos.

5. LIGAS CREADAS POR USUARIOS Y PREMIOS
Los usuarios pueden crear y administrar ligas privadas. Cualquier premio, recompensa o apuesta ofrecida por creadores o administradores de ligas es responsabilidad exclusiva de esos individuos. F1™ Poolers NO es responsable de ningún premio ofrecido, prometido o distribuido dentro de las ligas creadas por usuarios. No seremos responsables de ninguna disputa, falta de entrega o problemas derivados de premios específicos de la liga.

6. RESULTADOS DE CARRERAS Y CLASIFICACIONES OFICIALES
Los resultados de las carreras serán publicados por los administradores de F1™ Poolers dentro de las 2 (dos) horas posteriores al final oficial de cada evento. Estos resultados publicados son finales y oficiales para los propósitos de esta plataforma. Cualquier penalización, descalificación o cambio en las clasificaciones de pilotos/equipos que ocurra después de esta ventana de 2 horas NO afectará los resultados en F1™ Poolers. Las decisiones judiciales, apelaciones o cualquier procedimiento legal relacionado con los resultados de las carreras NO impactarán las clasificaciones dentro de esta plataforma.

7. CHAT Y CONTENIDO GENERADO POR USUARIOS
Los administradores de F1™ Poolers NO son responsables del contenido de los mensajes enviados por los usuarios en funciones de chat, chats de liga o cualquier otro canal de comunicación dentro de la plataforma. Los usuarios son los únicos responsables de sus propios mensajes y deben mantener una conducta respetuosa.

8. ELEGIBILIDAD
Debe tener al menos 18 años de edad para usar esta plataforma.

9. CONDUCTA DEL USUARIO
Los usuarios deben mantener una conducta deportiva y respetuosa en todo momento. Nos reservamos el derecho de suspender o prohibir permanentemente las cuentas por comportamiento abusivo, ofensivo o inapropiado.

10. PROPIEDAD INTELECTUAL
Todas las libreas de autos, fotos de pilotos y logotipos de equipos utilizados en esta aplicación son solo con fines ilustrativos y siguen siendo propiedad de sus respectivos titulares de derechos de autor.

11. LIMITACIÓN DE RESPONSABILIDAD
F1™ Poolers se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables de ningún daño derivado del uso de esta plataforma.

12. CAMBIOS EN LOS TÉRMINOS
Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. El uso continuado de la plataforma constituye la aceptación de cualquier cambio.

Al usar F1™ Poolers, usted reconoce que ha leído, entendido y acepta estar sujeto a estos Términos y Condiciones.`
    } };
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
