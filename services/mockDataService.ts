import { User, Driver, Team, Round, Event, EventStatus, EventType, Bet, Result, Notification, WinnerInfo, League, CoinPack, AdSettings, LeaguePrize, LeagueChatMessage, MemberStatus, SystemSettings } from '../types';

// --- INITIAL DATA (Static F1 Data - 2026 Season Lineup) ---

let teams: Team[] = [
  { id: 'redbull', name: 'Oracle Red Bull Racing', nationality: 'Austrian', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png.transform/2col/image.png' },
  { id: 'ferrari', name: 'Scuderia Ferrari HP', nationality: 'Italian', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png.transform/2col/image.png' },
  { id: 'mclaren', name: 'McLaren Formula 1 Team', nationality: 'British', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png.transform/2col/image.png' },
  { id: 'mercedes', name: 'Mercedes-AMG PETRONAS F1 Team', nationality: 'German', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png.transform/2col/image.png' },
  { id: 'astonmartin', name: 'Aston Martin Aramco F1 Team', nationality: 'British', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png.transform/2col/image.png' },
  { id: 'vcarb', name: 'Visa Cash App RB F1 Team', nationality: 'Italian', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png.transform/2col/image.png' },
  { id: 'haas', name: 'MoneyGram Haas F1 Team', nationality: 'American', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/haas-f1-team-logo.png.transform/2col/image.png' },
  { id: 'alpine', name: 'BWT Alpine F1 Team', nationality: 'French', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png.transform/2col/image.png' },
  { id: 'williams', name: 'Williams Racing', nationality: 'British', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png.transform/2col/image.png' },
  { id: 'audi', name: 'Audi F1 Team', nationality: 'German', logoUrl: 'https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png.transform/2col/image.png' }, // Placeholder logo for Audi
];

let drivers: Omit<Driver, 'teamName'>[] = [
  // Red Bull
  { id: 'verstappen', name: 'Max Verstappen', nationality: 'Dutch', teamId: 'redbull', number: 1, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/verstappen.jpg.img.1024.medium.jpg' },
  { id: 'lawson', name: 'Liam Lawson', nationality: 'New Zealander', teamId: 'redbull', number: 30, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/lawson.jpg.img.1024.medium.jpg' },
  
  // Ferrari
  { id: 'leclerc', name: 'Charles Leclerc', nationality: 'Monegasque', teamId: 'ferrari', number: 16, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/leclerc.jpg.img.1024.medium.jpg' },
  { id: 'hamilton', name: 'Lewis Hamilton', nationality: 'British', teamId: 'ferrari', number: 44, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/hamilton.jpg.img.1024.medium.jpg' },
  
  // McLaren
  { id: 'norris', name: 'Lando Norris', nationality: 'British', teamId: 'mclaren', number: 4, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/norris.jpg.img.1024.medium.jpg' },
  { id: 'piastri', name: 'Oscar Piastri', nationality: 'Australian', teamId: 'mclaren', number: 81, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/piastri.jpg.img.1024.medium.jpg' },
  
  // Mercedes
  { id: 'russell', name: 'George Russell', nationality: 'British', teamId: 'mercedes', number: 63, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/russell.jpg.img.1024.medium.jpg' },
  { id: 'antonelli', name: 'Kimi Antonelli', nationality: 'Italian', teamId: 'mercedes', number: 12, imageUrl: 'https://picsum.photos/seed/antonelli/200/200' }, // Placeholder image
  
  // Aston Martin
  { id: 'alonso', name: 'Fernando Alonso', nationality: 'Spanish', teamId: 'astonmartin', number: 14, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/alonso.jpg.img.1024.medium.jpg' },
  { id: 'stroll', name: 'Lance Stroll', nationality: 'Canadian', teamId: 'astonmartin', number: 18, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/stroll.jpg.img.1024.medium.jpg' },
  
  // Alpine
  { id: 'gasly', name: 'Pierre Gasly', nationality: 'French', teamId: 'alpine', number: 10, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/gasly.jpg.img.1024.medium.jpg' },
  { id: 'doohan', name: 'Jack Doohan', nationality: 'Australian', teamId: 'alpine', number: 7, imageUrl: 'https://picsum.photos/seed/doohan/200/200' }, // Placeholder image
  
  // Williams
  { id: 'albon', name: 'Alexander Albon', nationality: 'Thai', teamId: 'williams', number: 23, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/albon.jpg.img.1024.medium.jpg' },
  { id: 'sainz', name: 'Carlos Sainz', nationality: 'Spanish', teamId: 'williams', number: 55, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/sainz.jpg.img.1024.medium.jpg' },
  
  // Haas
  { id: 'ocon', name: 'Esteban Ocon', nationality: 'French', teamId: 'haas', number: 31, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/ocon.jpg.img.1024.medium.jpg' },
  { id: 'bearman', name: 'Oliver Bearman', nationality: 'British', teamId: 'haas', number: 87, imageUrl: 'https://picsum.photos/seed/bearman/200/200' }, // Placeholder image
  
  // VCARB
  { id: 'tsunoda', name: 'Yuki Tsunoda', nationality: 'Japanese', teamId: 'vcarb', number: 22, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/tsunoda.jpg.img.1024.medium.jpg' },
  { id: 'hadjar', name: 'Isack Hadjar', nationality: 'French', teamId: 'vcarb', number: 6, imageUrl: 'https://picsum.photos/seed/hadjar/200/200' }, // Placeholder image
  
  // Audi
  { id: 'hulkenberg', name: 'Nico Hulkenberg', nationality: 'German', teamId: 'audi', number: 27, imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/hulkenberg.jpg.img.1024.medium.jpg' },
  { id: 'bortoleto', name: 'Gabriel Bortoleto', nationality: 'Brazilian', teamId: 'audi', number: 5, imageUrl: 'https://picsum.photos/seed/bortoleto/200/200' }, // Placeholder image
];

const adminUser: User = {
  id: 'admin',
  username: 'admin',
  avatarUrl: 'https://picsum.photos/seed/adminuser/100/100',
  balance: 999999,
  rank: 0,
  points: 9999,
  password: 'admin',
  isAdmin: true,
  notifications: [],
  age: 99,
  country: 'FIA',
  joinedLeagues: []
};

let users: User[] = [adminUser];
let rounds: Round[] = [];
let events: Event[] = [];
let bets: Bet[] = [];
let results: Result[] = [];
let leagues: League[] = [
    {
        id: 'global-league',
        name: 'Official F1™ Pool League',
        description: 'The main public league for all users.',
        adminId: 'admin',
        isPrivate: false,
        inviteCode: 'PUBLIC',
        members: ['admin'],
        createdAt: new Date(),
        hasChat: false,
        messages: [],
        memberStatus: { 'admin': 'active' }
    }
];

let coinPacks: CoinPack[] = [
    { id: 'pack1', name: 'Starter Kit', coins: 100, price: 0.99, currency: 'USD' },
    { id: 'pack2', name: 'Racer Bundle', coins: 550, price: 4.99, currency: 'USD' },
    { id: 'pack3', name: 'Podium Stash', coins: 1200, price: 9.99, currency: 'USD' },
    { id: 'pack4', name: 'Championship Vault', coins: 3000, price: 24.99, currency: 'USD' },
];

let adSettings: AdSettings = {
    googleAdClientId: 'ca-pub-XXXXXXXXXXXXXXXX',
    rewardAmount: 25,
    isEnabled: true
};

let systemSettings: SystemSettings = {
    theme: 'original',
    termsContent: {
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
    }
};

// --- SERVICE ---

export const dataService = {
  // READ
  getUsers: async (): Promise<User[]> => Promise.resolve(users.map(u => { const { password, ...rest } = u; return rest as User; })),
  getUserById: async (id: string): Promise<User | undefined> => Promise.resolve(users.find(u => u.id === id)),
  findUserByUsername: async (username: string): Promise<User | undefined> => Promise.resolve(users.find(u => u.username === username)),
  getDrivers: async (): Promise<Driver[]> => {
    return Promise.resolve(drivers.map(d => {
        const team = teams.find(t => t.id === d.teamId);
        return { ...d, teamName: team?.name || 'Unknown' };
    }));
  },
  getTeams: async (): Promise<Team[]> => Promise.resolve(teams),
  getRounds: async (): Promise<Round[]> => Promise.resolve(rounds),
  getEvents: async (): Promise<Event[]> => Promise.resolve(events),
  getBetsForUser: async (userId: string): Promise<Bet[]> => Promise.resolve(bets.filter(b => b.userId === userId)),
  getAllBets: async (): Promise<Bet[]> => Promise.resolve(bets),
  getResults: async (): Promise<Result[]> => Promise.resolve(results),
  getLeagues: async (): Promise<League[]> => Promise.resolve(leagues),
  
  // Monetization & Settings Read
  getCoinPacks: async (): Promise<CoinPack[]> => Promise.resolve(coinPacks),
  getAdSettings: async (): Promise<AdSettings> => Promise.resolve(adSettings),
  getSystemSettings: async (): Promise<SystemSettings> => Promise.resolve(systemSettings),

  // WRITE
  createUser: async (username: string, password_raw: string, age: number, country: string, location?: {lat: number, lng: number}): Promise<User> => {
    if (users.some(u => u.username === username)) throw new Error('Username already exists');
    const newUser: User = {
      id: `user${users.length + 1}`,
      username,
      password: password_raw,
      avatarUrl: `https://picsum.photos/seed/${username}/100/100`,
      balance: 100, // Initial balance
      rank: users.length,
      points: 0,
      isAdmin: false,
      age,
      country,
      location,
      termsAccepted: true,
      notifications: [{
        id: `notif-${Date.now()}`,
        message: `Welcome to F1™ Pool, ${username}! You've received 100 Fun-Coins. Good luck!`,
        timestamp: new Date(),
        read: false,
        sender: 'System',
        type: 'general'
      }],
      joinedLeagues: ['global-league'] // Auto join global
    };
    users.push(newUser);
    leagues[0].members.push(newUser.id);
    leagues[0].memberStatus[newUser.id] = 'active';
    
    const { password, ...userWithoutPassword } = newUser;
    return Promise.resolve(userWithoutPassword as User);
  },

  updateUser: async (userData: Partial<User> & { id: string }): Promise<User> => {
    const index = users.findIndex(u => u.id === userData.id);
    if (index === -1) throw new Error('User not found');
    
    users[index] = { ...users[index], ...userData };
    const { password, ...userWithoutPassword } = users[index];
    return Promise.resolve(userWithoutPassword as User);
  },

  // League Methods
  createLeague: async (userId: string, name: string, description: string, isPrivate: boolean, hasChat: boolean, prize?: LeaguePrize): Promise<League> => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newLeague: League = {
          id: `league-${Date.now()}`,
          name,
          description,
          adminId: userId,
          isPrivate,
          inviteCode,
          members: [userId],
          createdAt: new Date(),
          hasChat,
          prize,
          messages: [],
          memberStatus: { [userId]: 'active' }
      };
      leagues.push(newLeague);
      
      // Add to user joined leagues
      const user = users.find(u => u.id === userId);
      if (user) {
          if (!user.joinedLeagues) user.joinedLeagues = [];
          user.joinedLeagues.push(newLeague.id);
      }
      
      return Promise.resolve(newLeague);
  },

  updateLeagueSettings: async(leagueId: string, settings: { hasChat?: boolean, prize?: LeaguePrize }): Promise<void> => {
      const league = leagues.find(l => l.id === leagueId);
      if(!league) throw new Error("League not found");
      
      if (settings.hasChat !== undefined) league.hasChat = settings.hasChat;
      if (settings.prize !== undefined) league.prize = settings.prize;
      
      return Promise.resolve();
  },

  joinLeague: async (userId: string, leagueId: string, code?: string): Promise<League> => {
      const league = leagues.find(l => l.id === leagueId);
      if (!league) throw new Error("League not found");
      if (league.members.includes(userId)) throw new Error("Already a member");
      
      if (league.isPrivate && code !== league.inviteCode) {
          throw new Error("Invalid invite code for private league");
      }

      league.members.push(userId);
      league.memberStatus[userId] = 'active'; // Default status

      const user = users.find(u => u.id === userId);
      if (user) {
          if (!user.joinedLeagues) user.joinedLeagues = [];
          user.joinedLeagues.push(leagueId);
      }

      return Promise.resolve(league);
  },

  leaveLeague: async (userId: string, leagueId: string): Promise<void> => {
      const league = leagues.find(l => l.id === leagueId);
      if (!league) throw new Error("League not found");
      
      league.members = league.members.filter(id => id !== userId);
      delete league.memberStatus[userId];
      
      const user = users.find(u => u.id === userId);
      if (user && user.joinedLeagues) {
          user.joinedLeagues = user.joinedLeagues.filter(id => id !== leagueId);
      }
      return Promise.resolve();
  },

  inviteUserToLeague: async (adminId: string, leagueId: string, targetUsername: string): Promise<void> => {
      const league = leagues.find(l => l.id === leagueId);
      if (!league) throw new Error("League not found");
      if (league.adminId !== adminId) throw new Error("Only admin can invite");

      const targetUser = users.find(u => u.username === targetUsername);
      if (!targetUser) throw new Error("User not found");
      if (league.members.includes(targetUser.id)) throw new Error("User already in league");

      const notification: Notification = {
          id: `invite-${Date.now()}`,
          message: `You have been invited to join the league "${league.name}".`,
          timestamp: new Date(),
          read: false,
          sender: 'League Admin',
          type: 'invite',
          meta: { leagueId: league.id, leagueName: league.name }
      };
      targetUser.notifications.push(notification);
      return Promise.resolve();
  },

  // League Chat & Moderation
  sendLeagueMessage: async (leagueId: string, userId: string, message: string): Promise<LeagueChatMessage> => {
      const league = leagues.find(l => l.id === leagueId);
      const user = users.find(u => u.id === userId);
      if (!league || !user) throw new Error("League or User not found");
      if (!league.hasChat) throw new Error("Chat is disabled for this league");
      
      const status = league.memberStatus[userId];
      if (status === 'banned') throw new Error("You are banned from this league.");
      if (status === 'suspended') throw new Error("You are suspended from chatting.");

      // Calculate global rank for highlighting (this is simplified, usually dynamic)
      // We'll update the ranks dynamically first
      const sortedUsers = [...users].sort((a,b) => b.points - a.points);
      const rank = sortedUsers.findIndex(u => u.id === userId) + 1;

      // Self-Cleaning: Keep last 10 days
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      league.messages = league.messages.filter(m => new Date(m.timestamp) > tenDaysAgo);

      const newMessage: LeagueChatMessage = {
          id: `msg-${Date.now()}`,
          userId,
          username: user.username,
          avatarUrl: user.avatarUrl,
          globalRank: rank,
          message,
          timestamp: new Date(),
          likes: [],
          dislikes: []
      };

      league.messages.push(newMessage);
      return Promise.resolve(newMessage);
  },

  reactToLeagueMessage: async (leagueId: string, messageId: string, userId: string, type: 'like' | 'dislike'): Promise<void> => {
      const league = leagues.find(l => l.id === leagueId);
      if (!league) return;
      
      const msg = league.messages.find(m => m.id === messageId);
      if (!msg) return;

      if (type === 'like') {
          if (msg.likes.includes(userId)) {
              msg.likes = msg.likes.filter(id => id !== userId); // Toggle off
          } else {
              msg.likes.push(userId);
              msg.dislikes = msg.dislikes.filter(id => id !== userId); // Remove dislike if exists
          }
      } else {
          if (msg.dislikes.includes(userId)) {
              msg.dislikes = msg.dislikes.filter(id => id !== userId); // Toggle off
          } else {
              msg.dislikes.push(userId);
              msg.likes = msg.likes.filter(id => id !== userId); // Remove like if exists
          }
      }
      return Promise.resolve();
  },

  moderateLeagueMember: async (leagueId: string, adminId: string, targetUserId: string, action: MemberStatus | 'unsuspend'): Promise<void> => {
      const league = leagues.find(l => l.id === leagueId);
      if (!league) throw new Error("League not found");
      if (league.adminId !== adminId) throw new Error("Only admin can moderate");
      if (adminId === targetUserId) throw new Error("Cannot moderate yourself");

      if (action === 'unsuspend') {
           league.memberStatus[targetUserId] = 'active';
      } else {
           league.memberStatus[targetUserId] = action;
      }
      return Promise.resolve();
  },

  createRound: async (roundData: Omit<Round, 'id'>): Promise<Round> => {
    const newRound: Round = { ...roundData, id: `round${rounds.length + 1}` };
    rounds.push(newRound);
    
    // Admin creates "New round" -> 50 added to every user
    users.forEach(u => {
      u.balance += 50;
      u.notifications.push({
        id: `notif-roundbonus-${newRound.id}-${u.id}`,
        message: `New Round Created: ${newRound.name}! You received 50 Fun-Coins.`,
        timestamp: new Date(),
        read: false,
        sender: 'System',
        type: 'general'
      });
    });

    return Promise.resolve(newRound);
  },

  updateRound: async (roundData: Round): Promise<Round> => {
    const index = rounds.findIndex(r => r.id === roundData.id);
    if (index === -1) throw new Error('Round not found');
    rounds[index] = roundData;
    return Promise.resolve(roundData);
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'poolPrize' | 'status'>): Promise<Event> => {
    const newEvent: Event = { ...eventData, id: `event${events.length + 1}`, poolPrize: 0, status: EventStatus.UPCOMING };
    events.push(newEvent);
    return Promise.resolve(newEvent);
  },

  updateEvent: async (eventData: Event): Promise<Event> => {
    const eventIndex = events.findIndex(e => e.id === eventData.id);
    if (eventIndex === -1) throw new Error('Event not found for update');
    events[eventIndex] = { ...events[eventIndex], ...eventData };
    return Promise.resolve(events[eventIndex]);
  },
  
  createTeam: async (teamData: Omit<Team, 'id'>): Promise<Team> => {
    const newTeam: Team = { ...teamData, id: teamData.name.toLowerCase().replace(/\s/g, '') };
    teams.push(newTeam);
    return Promise.resolve(newTeam);
  },

  updateTeam: async (teamData: Team): Promise<Team> => {
    const index = teams.findIndex(t => t.id === teamData.id);
    if (index === -1) throw new Error('Team not found');
    teams[index] = teamData;
    return Promise.resolve(teamData);
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    if (drivers.some(d => d.teamId === teamId)) {
      throw new Error("Cannot delete team with assigned drivers.");
    }
    teams = teams.filter(t => t.id !== teamId);
    return Promise.resolve();
  },

  createDriver: async (driverData: Omit<Driver, 'id' | 'teamName'>): Promise<Driver> => {
    const newDriver: Omit<Driver, 'teamName'> = { ...driverData, id: driverData.name.toLowerCase().replace(/\s/g, '') };
    drivers.push(newDriver);
    const team = teams.find(t => t.id === newDriver.teamId);
    return Promise.resolve({ ...newDriver, teamName: team?.name || 'Unknown' });
  },

  updateDriver: async (driverData: Omit<Driver, 'teamName'>): Promise<Driver> => {
    const index = drivers.findIndex(d => d.id === driverData.id);
    if (index === -1) throw new Error('Driver not found');
    drivers[index] = driverData;
    const team = teams.find(t => t.id === driverData.teamId);
    return Promise.resolve({ ...driverData, teamName: team?.name || 'Unknown' });
  },

  deleteDriver: async (driverId: string): Promise<void> => {
    drivers = drivers.filter(d => d.id !== driverId);
    return Promise.resolve();
  },

  placeBet: async (betData: Omit<Bet, 'id' | 'timestamp' | 'status' | 'lockedMultiplier'>): Promise<{updatedUser: User, updatedEvent: Event}> => {
    const user = users.find(u => u.id === betData.userId);
    const event = events.find(e => e.id === betData.eventId);
    if (!user || !event) throw new Error('User or Event not found');
    if (user.balance < event.betValue) throw new Error('Insufficient balance');
    if (event.status !== EventStatus.UPCOMING) throw new Error('Betting is closed for this event.');
    
    // LIMIT CHECK: Max 4 active bets per event per user (Updated from 2 to 4)
    const existingActiveBets = bets.filter(b => b.userId === betData.userId && b.eventId === betData.eventId && b.status === 'Active');
    if (existingActiveBets.length >= 4) throw new Error('Maximum of 4 active bets per event allowed.');

    // Calculate Multiplier based on time until event (in seconds)
    const now = new Date().getTime();
    const eventTime = event.date.getTime();
    const secondsRemaining = (eventTime - now) / 1000;
    
    let multiplier = 1.0;
    if (secondsRemaining > 432000) multiplier = 5.0; // > 5 days
    else if (secondsRemaining > 259200) multiplier = 3.0; // > 3 days
    else if (secondsRemaining > 86400) multiplier = 1.5; // > 1 day
    else multiplier = 1.0; // < 1 day

    user.balance -= event.betValue;
    event.poolPrize += event.betValue;
    
    const newBet: Bet = { 
      ...betData, 
      id: `bet${bets.length + 1}`, 
      timestamp: new Date(),
      status: 'Active',
      lockedMultiplier: multiplier
    };
    bets.push(newBet);
    
    const { password, ...userWithoutPassword } = user;
    return Promise.resolve({updatedUser: userWithoutPassword as User, updatedEvent: event});
  },

  cancelBet: async (betId: string): Promise<void> => {
    const betIndex = bets.findIndex(b => b.id === betId);
    if (betIndex === -1) throw new Error('Bet not found');
    const bet = bets[betIndex];
    
    if (bet.status !== 'Active') throw new Error('Can only cancel active bets');

    const event = events.find(e => e.id === bet.eventId);
    const user = users.find(u => u.id === bet.userId);

    if (!event || !user) throw new Error('Associated event or user not found');

    // Refund
    user.balance += event.betValue;
    event.poolPrize -= event.betValue;
    bets[betIndex].status = 'Cancelled';

    // Notify
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      message: `Your bet for ${event.type} has been cancelled. ${event.betValue} Fun-Coins have been refunded to your balance.`,
      timestamp: new Date(),
      read: false,
      sender: 'System',
      type: 'general'
    };
    user.notifications.push(notification);

    return Promise.resolve();
  },

  sendNotification: async (target: { type: 'all' | 'user' | 'filter', userId?: string, criteria?: { minAge?: number, maxAge?: number, country?: string } }, message: string): Promise<void> => {
    const newNotif: Omit<Notification, 'id'> = {
      message,
      timestamp: new Date(),
      read: false,
      sender: 'Admin',
      type: 'general'
    };

    let targetUsers: User[] = [];

    if (target.type === 'all') {
      targetUsers = users;
    } else if (target.type === 'user' && target.userId) {
      const u = users.find(u => u.id === target.userId);
      if (u) targetUsers = [u];
    } else if (target.type === 'filter' && target.criteria) {
      targetUsers = users.filter(u => {
        let match = true;
        if (target.criteria?.minAge && (u.age || 0) < target.criteria.minAge) match = false;
        if (target.criteria?.maxAge && (u.age || 0) > target.criteria.maxAge) match = false;
        if (target.criteria?.country && u.country?.toLowerCase() !== target.criteria.country.toLowerCase()) match = false;
        return match;
      });
    }

    targetUsers.forEach(u => {
      u.notifications.push({ ...newNotif, id: `notif-${Math.random()}` });
    });

    return Promise.resolve();
  },

  markNotificationRead: async (userId: string, notifId: string): Promise<User> => {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    const notif = user.notifications.find(n => n.id === notifId);
    if (notif) notif.read = true;
    const { password, ...userWithoutPassword } = user;
    return Promise.resolve(userWithoutPassword as User);
  },

  addResults: async (resultData: Omit<Result, 'winners' | 'totalPrizePool'>): Promise<void> => {
    const event = events.find(e => e.id === resultData.eventId);
    if (!event) throw new Error('Event not found');
    
    const eventBets = bets.filter(b => b.eventId === resultData.eventId && b.status === 'Active');
    
    // Points Configuration based on Event Type
    let pointConfig = {
      exact: [0, 0, 0, 0, 0],
      partial: 0
    };

    if (event.type === EventType.MAIN_RACE) {
      pointConfig = { exact: [25, 18, 15, 12, 10], partial: 5 };
    } else if (event.type === EventType.SPRINT_RACE) {
      pointConfig = { exact: [8, 7, 6, 5, 4], partial: 2 };
    } else if (event.type === EventType.QUALIFYING) {
      pointConfig = { exact: [18, 15, 12, 9, 6], partial: 3 };
    } else {
        // Default/Practice
        pointConfig = { exact: [5, 4, 3, 2, 1], partial: 1 };
    }

    const winnersInfo: WinnerInfo[] = [];
    const potWinners: Bet[] = [];

    // --- GRADING LOGIC ---
    eventBets.forEach(bet => {
        let rawDriverPoints = 0;
        let rawTeamPoints = 0;
        
        // Critical: Initializing to false ensures empty driver bets don't win jackpot
        let isDriverPerfectMatch = bet.predictions && bet.predictions.length === 5;

        // Check top 5 predictions (Drivers)
        if (bet.predictions && bet.predictions.length === 5) {
            for (let i = 0; i < 5; i++) {
                const predictedDriverId = bet.predictions[i]?.id;
                const actualDriverId = resultData.positions[i]?.id;
                
                if (!predictedDriverId || !actualDriverId) {
                    isDriverPerfectMatch = false;
                    continue;
                }

                if (predictedDriverId === actualDriverId) {
                    // Exact Match
                    rawDriverPoints += pointConfig.exact[i];
                } else {
                    isDriverPerfectMatch = false;
                    // Check if the predicted driver finished anywhere in the top 5
                    const driverFinishedInTop5 = resultData.positions.some(d => d.id === predictedDriverId);
                    if (driverFinishedInTop5) {
                        rawDriverPoints += pointConfig.partial;
                    }
                }
            }
        } else {
            isDriverPerfectMatch = false;
        }

        // Check top 5 predictions (Teams)
        if (bet.teamPredictions && bet.teamPredictions.length === 5) {
            for (let i = 0; i < 5; i++) {
                const predictedTeamId = bet.teamPredictions[i]?.id;
                const actualDriver = resultData.positions[i];
                const actualTeamId = actualDriver?.teamId;

                if (!predictedTeamId || !actualTeamId) continue;

                if (predictedTeamId === actualTeamId) {
                    rawTeamPoints += (pointConfig.exact[i] / 2);
                } else {
                    const top5Teams = resultData.positions.map(d => d.teamId);
                    if (top5Teams.includes(predictedTeamId)) {
                        rawTeamPoints += (pointConfig.partial / 2);
                    }
                }
            }
        }

        const totalRawPoints = rawDriverPoints + rawTeamPoints;

        // Apply Multiplier
        const finalPoints = Math.round(totalRawPoints * bet.lockedMultiplier);
        
        // Update User Points
        const user = users.find(u => u.id === bet.userId);
        if (user) {
            user.points += finalPoints;
        }

        bet.status = 'Settled';

        // Check for Pot Winner
        if (isDriverPerfectMatch) {
            potWinners.push(bet);
        }
    });

    // --- POT DISTRIBUTION ---
    if (potWinners.length > 0 && event.poolPrize > 0) {
        const prizePerWinner = Math.floor(event.poolPrize / potWinners.length);
        
        potWinners.forEach(winnerBet => {
            const winnerUser = users.find(u => u.id === winnerBet.userId);
            if (winnerUser) {
                winnerUser.balance += prizePerWinner;
                winnerUser.notifications.push({
                    id: `notif-${Date.now()}-${winnerUser.id}`,
                    message: `🏆 JACKPOT! You NAILED the result for ${event.type}! You won ${prizePerWinner} Fun-Coins!`,
                    timestamp: new Date(),
                    read: false,
                    sender: 'System',
                    type: 'general'
                });
            }
        });
    }

    eventBets.forEach(bet => {
        const user = users.find(u => u.id === bet.userId);
        if (user) {
            let rawD = 0;
            let rawT = 0;
            if (bet.predictions && bet.predictions.length === 5) {
                for (let i = 0; i < 5; i++) {
                    if (bet.predictions[i]?.id === resultData.positions[i]?.id) rawD += pointConfig.exact[i];
                    else if (resultData.positions.some(d => d.id === bet.predictions[i]?.id)) rawD += pointConfig.partial;
                }
            }
            if (bet.teamPredictions && bet.teamPredictions.length === 5) {
                 for (let i = 0; i < 5; i++) {
                    const actualTeam = resultData.positions[i]?.teamId;
                    if (bet.teamPredictions[i]?.id === actualTeam) rawT += (pointConfig.exact[i] / 2);
                    else if (resultData.positions.some(d => d.teamId === bet.teamPredictions[i]?.id)) rawT += (pointConfig.partial / 2);
                }
            }
            const pts = Math.round((rawD + rawT) * bet.lockedMultiplier);
            const prize = potWinners.includes(bet) ? Math.floor(event.poolPrize / potWinners.length) : 0;
            if (prize > 0 || pts > 0) {
                winnersInfo.push({
                    userId: user.id,
                    username: user.username,
                    prizeAmount: prize,
                    pointsEarned: pts
                });
            }
        }
    });

    event.status = EventStatus.FINISHED;

    const fullResult: Result = {
        ...resultData,
        winners: winnersInfo.sort((a,b) => b.prizeAmount - a.prizeAmount || b.pointsEarned - a.pointsEarned),
        totalPrizePool: event.poolPrize
    };
    results.push(fullResult);

    return Promise.resolve();
  },

  // Monetization Write
  updateAdSettings: async (settings: AdSettings): Promise<void> => {
      adSettings = settings;
      return Promise.resolve();
  },

  createCoinPack: async (pack: Omit<CoinPack, 'id'>): Promise<CoinPack> => {
      const newPack = { ...pack, id: `pack-${Date.now()}` };
      coinPacks.push(newPack);
      return Promise.resolve(newPack);
  },

  updateCoinPack: async (pack: CoinPack): Promise<void> => {
      const idx = coinPacks.findIndex(p => p.id === pack.id);
      if (idx !== -1) coinPacks[idx] = pack;
      return Promise.resolve();
  },

  deleteCoinPack: async (id: string): Promise<void> => {
      coinPacks = coinPacks.filter(p => p.id !== id);
      return Promise.resolve();
  },

  processAdReward: async (userId: string): Promise<User> => {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error("User not found");
      
      user.balance += adSettings.rewardAmount;
      return Promise.resolve(user);
  },

  purchaseCoinPack: async (userId: string, packId: string): Promise<User> => {
      const user = users.find(u => u.id === userId);
      const pack = coinPacks.find(p => p.id === packId);
      if (!user) throw new Error("User not found");
      if (!pack) throw new Error("Pack not found");

      // Simulating external payment processing success
      user.balance += pack.coins;
      return Promise.resolve(user);
  },

  // System Settings
  updateSystemSettings: async (settings: SystemSettings): Promise<void> => {
      systemSettings = settings;
      return Promise.resolve();
  }
};