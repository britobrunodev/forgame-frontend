import type { Sport, Championship, ReservationPlace, User, Court, Team, ManagedPlayer, ManagedChampionship, ManagedCourtPayment } from '@/types';
import placeCopacabana from '@/assets/place-copacabana.jpg';
import placeFtm from '@/assets/place-ftm.jpg';
import placeContorno from '@/assets/place-contorno.jpg';
import placeJurere from '@/assets/place-jurere.jpg';
import champCopaRio from '@/assets/champ-copa-rio.jpg';
import champFloripa from '@/assets/champ-floripa.jpg';

export const SPORTS: Sport[] = [
  { id: 'footvolley', name: 'Footvolley', icon: '🏐' },
  { id: 'beach-tennis', name: 'Beach Tennis', icon: '🎾' },
  { id: 'beach-soccer', name: 'Futebol', icon: '⚽' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
];

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Rafael Souza',
  email: 'rafa@jogajunto360.com',
  type: 'player',
  profiles: ['player', 'gestor'],
  gestorRoles: ['owner', 'manager', 'professor'],
  preferences: ['footvolley', 'beach-tennis'],
  applications: ['FTM Sports Center', 'Contorno da Bola'],
  country: 'BR',
  phoneCountry: 'BR',
  phoneNumber: '(21) 99876-5432',
  sportCharacteristics: {
    footvolley: ['left'],
    'beach-tennis': ['right'],
  },
  level: 'intermediate',
  wins: 0,
  losses: 0,
  draws: 0,
  ownedComplexIds: ['p2', 'p3'],
};

export const MANAGED_PLAYERS: ManagedPlayer[] = [
  { id: 'pl1', name: 'Rafael Souza', email: 'rafa@jogajunto360.com', complexId: 'p2', sports: ['footvolley', 'beach-tennis'], level: 'intermediate', score: 1240 },
  { id: 'pl2', name: 'Sandrey Lima', email: 'sandrey@jogajunto360.com', complexId: 'p1', sports: ['footvolley'], level: 'professional', score: 1860 },
  { id: 'pl3', name: 'Brisa Almeida', email: 'brisa@jogajunto360.com', complexId: 'p1', sports: ['footvolley'], level: 'gold', score: 1620 },
  { id: 'pl4', name: 'Victor Nunes', email: 'victor@jogajunto360.com', complexId: 'p2', sports: ['footvolley', 'volleyball'], level: 'advanced', score: 1410 },
  { id: 'pl5', name: 'Carol Tavares', email: 'carol@jogajunto360.com', complexId: 'p4', sports: ['beach-tennis'], level: 'silver', score: 1500 },
  { id: 'pl6', name: 'Marina Costa', email: 'marina@jogajunto360.com', complexId: 'p4', sports: ['beach-tennis'], level: 'beginner', score: 980 },
  { id: 'pl7', name: 'João Pedro', email: 'joao@jogajunto360.com', complexId: 'p3', sports: ['beach-soccer'], level: 'intermediate', score: 1180 },
  { id: 'pl8', name: 'Lucas Prado', email: 'lucas@jogajunto360.com', complexId: 'p3', sports: ['beach-soccer', 'footvolley'], level: 'advanced', score: 1360 },
];

export const FRIENDS = [
  { id: 'fr1', name: 'Brisa', handle: '@brisa', sport: 'footvolley' as const, status: 'Live em Copacabana', image: champCopaRio },
  { id: 'fr2', name: 'Carol', handle: '@carolt', sport: 'beach-tennis' as const, status: 'Treino em Floripa', image: champFloripa },
  { id: 'fr3', name: 'Victor', handle: '@victorn', sport: 'footvolley' as const, status: 'Classificado', image: placeFtm },
  { id: 'fr4', name: 'João', handle: '@joaopedro', sport: 'beach-soccer' as const, status: 'Reserva confirmada', image: placeContorno },
];

export const SOCIAL_FEED = [
  {
    id: 'post1',
    author: 'Joga Junto 360',
    role: 'Arena Update',
    image: champCopaRio,
    title: 'Copa Rio Footvolley 2026 já está ao vivo',
    body: 'A quadra principal em Copacabana já abriu com jogos da chave profissional e transmissão rolando direto pelo app.',
    metricA: '1.2k views',
    metricB: '84 comments',
  },
  {
    id: 'post2',
    author: 'Brisa Almeida',
    role: 'Friend Activity',
    image: champFloripa,
    title: 'Brisa entrou no Beach Tennis Open Floripa',
    body: 'Sua amiga acabou de confirmar a inscrição na categoria Ouro e está montando dupla para sábado.',
    metricA: '36 likes',
    metricB: '12 comments',
  },
  {
    id: 'post3',
    author: 'FTM Sports Center',
    role: 'Complex Highlight',
    image: placeFtm,
    title: 'Quadras abertas para amistosos de sexta',
    body: 'O complexo liberou novas janelas para reservas noturnas e abriu lista de espera para professores.',
    metricA: '18 saves',
    metricB: '9 shares',
  },
];

const roundNameByTeamCount: Record<number, string> = {
  32: 'Round of 32',
  16: 'Round of 16',
  8: 'Quarter-finals',
  4: 'Semi-finals',
  2: 'Final',
};

const getWinner = (status: 'scheduled' | 'live' | 'finished', scoreA?: number, scoreB?: number, teamA?: Team | null, teamB?: Team | null) => {
  if (status !== 'finished' || !teamA || !teamB || scoreA === undefined || scoreB === undefined) return null;
  return scoreA >= scoreB ? teamA : teamB;
};

const buildBracket = (teams: string[]) => {
  let currentTeams: Array<Team | null> = teams.map((name, index) => ({
    id: `team-${index + 1}`,
    name,
    seed: index + 1,
  }));
  const rounds: Championship['rounds'] = [];
  let roundIndex = 0;

  while (currentTeams.length >= 2) {
    const roundName = roundNameByTeamCount[currentTeams.length] ?? `Round of ${currentTeams.length}`;
    const matches: Championship['rounds'][number]['matches'] = [];
    const nextTeams: Array<Team | null> = [];

    for (let i = 0; i < currentTeams.length; i += 2) {
      const teamA = currentTeams[i] ?? null;
      const teamB = currentTeams[i + 1] ?? null;
      const matchNumber = i / 2;
      const isFirstRound = roundIndex === 0;
      const status = isFirstRound
        ? matchNumber < 4
          ? 'finished'
          : matchNumber < 8
            ? 'live'
            : 'scheduled'
        : 'scheduled';
      const scoreA = status === 'finished' ? 18 : status === 'live' ? 12 : undefined;
      const scoreB = status === 'finished' ? 14 : status === 'live' ? 12 : undefined;
      const setScoreA = status === 'finished' ? 2 : status === 'live' ? 1 : undefined;
      const setScoreB = status === 'finished' ? 1 : status === 'live' ? 1 : undefined;

      matches.push({
        id: `r${roundIndex + 1}-${matchNumber + 1}`,
        round: roundName,
        teamA,
        teamB,
        setScoreA,
        setScoreB,
        status,
        scoreA,
        scoreB,
      });

      nextTeams.push(getWinner(status, scoreA, scoreB, teamA, teamB));
    }

    rounds.push({ name: roundName, matches });
    currentTeams = nextTeams;
    roundIndex += 1;
  }

  return rounds;
};

const today = new Date().toISOString().slice(0, 10);
const addDays = (dateValue: string, days: number) => {
  const nextDate = new Date(`${dateValue}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
};
const reservationWindowDates = Array.from({ length: 5 }, (_, index) => addDays(today, index));
const defaultSlotOptions = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
  { start: '18:00', end: '19:00' },
  { start: '19:00', end: '20:00' },
];

export const CHAMPIONSHIPS: Championship[] = [
  {
    id: 'c1',
    name: 'Copa Rio Footvolley 2026',
    sport: 'footvolley',
    location: 'Praia de Copacabana, RJ',
    startDate: today,
    endDate: today,
    teamsCount: 32,
    status: 'live',
    banner: undefined,
    image: champCopaRio,
    prize: 'R$ 50.000',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rounds: buildBracket([
      'Sandrey & Brisa', 'Dioguinho & Giovani', 'Victor & Thierry', 'Aguia & Bruninho',
      'Longo & Michel', 'Bruno B. & Kibinho', 'Gui & Juninho', 'Renan & Neguinho',
      'Vitinho & Paraná', 'Chau & Thallys', 'Saldanha & Juninho', 'Hiltinho & Franklin',
      'Biel & Pablo', 'Dudu & Arthur', 'Leo & Eduzinho', 'Indio & Felipe',
      'Japa & Murilo', 'Ryan & Felipe', 'Gui Neto & Pedrinho', 'Marquinhos & Davi',
      'Parazinho & Ruan', 'Lucas & Junin', 'Mateus & Cassio', 'Daniel & Guto',
      'Neto & Beto', 'Tavinho & JP', 'Luan & Nino', 'Kaue & Erick',
      'Pablo & Cesar', 'Joao Pedro & Lipe', 'Galego & Raul', 'Breno & Natan',
    ]),
  },
  {
    id: 'c2',
    name: 'Beach Tennis Open Floripa',
    sport: 'beach-tennis',
    location: 'Jurerê Internacional, SC',
    startDate: today,
    endDate: today,
    teamsCount: 32,
    status: 'live',
    banner: undefined,
    image: champFloripa,
    prize: 'R$ 30.000',
    youtubeUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    rounds: buildBracket([
      'Carol & Bia', 'Mari & Lu', 'Ana & Duda', 'Leticia & Sofia',
      'Paula & Nina', 'Helena & Vivi', 'Clara & Manu', 'Joana & Raquel',
      'Camila & Bruna', 'Larissa & Tati', 'Isa & Gabi', 'Carla & Fernanda',
      'Yasmin & Dani', 'Patricia & Karen', 'Renata & Aline', 'Juliana & Roberta',
      'Bella & Ju', 'Malu & Teca', 'Lara & Carol', 'Taina & Livia',
      'Debora & Priscila', 'Rita & Bea', 'Paola & Cris', 'Mirela & Cami',
      'Alice & Manuella', 'Nina & Paula', 'Tata & Ellen', 'Valen & Caca',
      'Rafa & Dri', 'Ester & Marih', 'Nath & Gi', 'Bela & Lais',
    ]),
  },
  {
    id: 'c3',
    name: 'Liga Nacional de Footvolley',
    sport: 'footvolley',
    location: 'São Paulo, SP',
    startDate: '2026-05-12',
    endDate: '2026-05-20',
    teamsCount: 32,
    status: 'upcoming',
    banner: undefined,
    prize: 'R$ 80.000',
    youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    rounds: buildBracket(Array.from({ length: 32 }, (_, i) => `Team ${i + 1}`)),
  },
  {
    id: 'c4',
    name: 'Copa Futebol',
    sport: 'beach-soccer',
    location: 'Recife, PE',
    startDate: '2026-05-05',
    endDate: '2026-05-08',
    teamsCount: 32,
    status: 'upcoming',
    banner: undefined,
    rounds: buildBracket(Array.from({ length: 32 }, (_, i) => `Squad ${i + 1}`)),
  },
];

export const MANAGED_CHAMPIONSHIPS: ManagedChampionship[] = [
  {
    id: 'mc1',
    complexId: 'p2',
    name: 'Liga Nacional de Footvolley',
    sport: 'footvolley',
    startDate: '2026-05-12',
    endDate: '2026-05-20',
    teamsCount: 32,
    status: 'upcoming',
    image: placeFtm,
    payments: [
      {
        userId: 'pl1',
        userName: 'Rafael Souza',
        userEmail: 'rafa@jogajunto360.com',
        totalAmount: 180,
        paidAmount: 180,
        remainingAmount: 0,
        status: 'paid',
        transactions: [
          { id: 'txn-1001', reference: 'PIX-88124', amount: 180, method: 'pix', paidAt: '2026-05-03 10:14', status: 'paid' },
        ],
      },
      {
        userId: 'pl4',
        userName: 'Victor Nunes',
        userEmail: 'victor@jogajunto360.com',
        totalAmount: 180,
        paidAmount: 90,
        remainingAmount: 90,
        status: 'pending',
        transactions: [
          { id: 'txn-1002', reference: 'CARD-22017', amount: 90, method: 'credit-card', paidAt: '2026-05-04 18:11', status: 'failed' },
          { id: 'txn-1003', reference: 'CARD-22018', amount: 90, method: 'credit-card', paidAt: '2026-05-04 18:32', status: 'paid' },
          { id: 'txn-1004', reference: 'OPEN-22019', amount: 90, method: 'pay-on-site', paidAt: '2026-05-12 08:00', status: 'pending' },
        ],
      },
    ],
  },
  {
    id: 'mc2',
    complexId: 'p3',
    name: 'Copa Futebol',
    sport: 'beach-soccer',
    startDate: '2026-05-05',
    endDate: '2026-05-08',
    teamsCount: 32,
    status: 'upcoming',
    image: placeContorno,
    payments: [
      {
        userId: 'pl7',
        userName: 'João Pedro',
        userEmail: 'joao@jogajunto360.com',
        totalAmount: 140,
        paidAmount: 140,
        remainingAmount: 0,
        status: 'paid',
        transactions: [
          { id: 'txn-1005', reference: 'DEBIT-11882', amount: 140, method: 'debit-card', paidAt: '2026-04-29 09:42', status: 'paid' },
        ],
      },
      {
        userId: 'pl8',
        userName: 'Lucas Prado',
        userEmail: 'lucas@jogajunto360.com',
        totalAmount: 140,
        paidAmount: 0,
        remainingAmount: 140,
        status: 'pending',
        transactions: [
          { id: 'txn-1006', reference: 'PIX-33000', amount: 140, method: 'pix', paidAt: '2026-04-28 17:06', status: 'failed' },
          { id: 'txn-1007', reference: 'OPEN-33001', amount: 140, method: 'pay-on-site', paidAt: '2026-05-05 07:30', status: 'pending' },
        ],
      },
    ],
  },
  {
    id: 'mc3',
    complexId: 'p2',
    name: 'FTM Winter Cup',
    sport: 'volleyball',
    startDate: '2026-04-30',
    endDate: '2026-05-01',
    teamsCount: 16,
    status: 'live',
    image: placeFtm,
    payments: [
      {
        userId: 'pl9',
        userName: 'Marina Lopes',
        userEmail: 'marina.lopes@jogajunto360.com',
        totalAmount: 220,
        paidAmount: 220,
        remainingAmount: 0,
        status: 'paid',
        transactions: [
          { id: 'txn-1008', reference: 'PIX-11923', amount: 220, method: 'pix', paidAt: '2026-04-26 16:08', status: 'paid' },
        ],
      },
    ],
  },
  {
    id: 'mc4',
    complexId: 'p3',
    name: 'Open Contorno 2026',
    sport: 'footvolley',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    teamsCount: 24,
    status: 'finished',
    image: placeContorno,
    payments: [
      {
        userId: 'pl10',
        userName: 'Bruno Teixeira',
        userEmail: 'bruno.teixeira@jogajunto360.com',
        totalAmount: 160,
        paidAmount: 160,
        remainingAmount: 0,
        status: 'paid',
        transactions: [
          { id: 'txn-1009', reference: 'CARD-99210', amount: 80, method: 'credit-card', paidAt: '2026-02-22 13:11', status: 'paid' },
          { id: 'txn-1010', reference: 'CARD-99258', amount: 80, method: 'credit-card', paidAt: '2026-03-01 11:20', status: 'paid' },
        ],
      },
      {
        userId: 'pl11',
        userName: 'César Moura',
        userEmail: 'cesar.moura@jogajunto360.com',
        totalAmount: 160,
        paidAmount: 160,
        remainingAmount: 0,
        status: 'paid',
        transactions: [
          { id: 'txn-1011', reference: 'PIX-44281', amount: 160, method: 'pix', paidAt: '2026-02-25 08:45', status: 'paid' },
        ],
      },
    ],
  },
];

export const MANAGED_COURT_PAYMENTS: ManagedCourtPayment[] = [
  {
    id: 'cp1',
    complexId: 'p2',
    courtId: 'ct3',
    courtName: 'Quadra Central',
    reservationDate: today,
    timeSlot: '09:00 - 10:00',
    userId: 'pl1',
    userName: 'Rafael Souza',
    userEmail: 'rafa@jogajunto360.com',
    totalAmount: 140,
    paidAmount: 140,
    remainingAmount: 0,
    status: 'paid',
    transactions: [
      { id: 'ctx-2001', reference: 'PIX-71221', amount: 140, method: 'pix', paidAt: '2026-04-29 08:21', status: 'paid' },
    ],
  },
  {
    id: 'cp2',
    complexId: 'p2',
    courtId: 'ct4',
    courtName: 'Quadra 4',
    reservationDate: today,
    timeSlot: '17:00 - 18:00',
    userId: 'pl4',
    userName: 'Victor Nunes',
    userEmail: 'victor@jogajunto360.com',
    totalAmount: 110,
    paidAmount: 110,
    remainingAmount: 0,
    status: 'paid',
    transactions: [
      { id: 'ctx-2002', reference: 'CARD-22077', amount: 110, method: 'credit-card', paidAt: '2026-04-29 16:02', status: 'failed' },
      { id: 'ctx-2003', reference: 'CARD-22078', amount: 110, method: 'credit-card', paidAt: '2026-04-29 16:07', status: 'paid' },
    ],
  },
  {
    id: 'cp3',
    complexId: 'p3',
    courtId: 'ct5',
    courtName: 'Arena 1',
    reservationDate: today,
    timeSlot: '15:00 - 16:00',
    userId: 'pl7',
    userName: 'João Pedro',
    userEmail: 'joao@jogajunto360.com',
    totalAmount: 95,
    paidAmount: 0,
    remainingAmount: 95,
    status: 'pending',
    transactions: [
      { id: 'ctx-2004', reference: 'PIX-88311', amount: 95, method: 'pix', paidAt: '2026-04-30 09:12', status: 'failed' },
      { id: 'ctx-2005', reference: 'OPEN-88312', amount: 95, method: 'pay-on-site', paidAt: '2026-04-30 15:00', status: 'pending' },
    ],
  },
  {
    id: 'cp4',
    complexId: 'p3',
    courtId: 'ct6',
    courtName: 'Arena 2',
    reservationDate: addDays(today, 1),
    timeSlot: '18:00 - 19:00',
    userId: 'pl8',
    userName: 'Lucas Prado',
    userEmail: 'lucas@jogajunto360.com',
    totalAmount: 110,
    paidAmount: 110,
    remainingAmount: 0,
    status: 'paid',
    transactions: [
      { id: 'ctx-2006', reference: 'DEBIT-44102', amount: 110, method: 'debit-card', paidAt: '2026-04-30 10:43', status: 'paid' },
    ],
  },
];

export const RESERVATION_PLACES: ReservationPlace[] = [
  { id: 'p1', name: 'Arena Beach Copacabana', city: 'Rio de Janeiro', sports: ['footvolley', 'beach-tennis'], courts: 8, rating: 4.8, image: placeCopacabana },
  { id: 'p2', name: 'FTM Sports Center', city: 'São Paulo', sports: ['footvolley', 'volleyball'], courts: 12, rating: 4.9, image: placeFtm },
  { id: 'p3', name: 'Contorno da Bola', city: 'Belo Horizonte', sports: ['footvolley', 'beach-soccer'], courts: 6, rating: 4.7, image: placeContorno },
  { id: 'p4', name: 'Jurerê Beach Club', city: 'Florianópolis', sports: ['beach-tennis', 'volleyball'], courts: 10, rating: 4.9, image: placeJurere },
];

export const COURTS: Court[] = [
  {
    id: 'ct1',
    name: 'Quadra 1',
    complexId: 'p1',
    dimensions: '9x18m',
    application: 'Arena Beach Copacabana',
    hourlyRate: 120,
    monthlyRate: 420,
    slotOptions: defaultSlotOptions,
    reservations: [
      { date: today, start: '08:00', end: '09:00', user: 'João S.' },
      ...reservationWindowDates.map((date) => ({
        date,
        start: '18:00',
        end: '19:00',
        user: 'Maria L.',
        type: 'monthly' as const,
      })),
    ],
  },
  {
    id: 'ct2',
    name: 'Quadra 2',
    complexId: 'p1',
    dimensions: '8x16m',
    application: 'Arena Beach Copacabana',
    hourlyRate: 100,
    monthlyRate: 360,
    slotOptions: defaultSlotOptions,
    reservations: [
      ...reservationWindowDates.map((date) => ({
        date,
        start: '10:00',
        end: '11:00',
        user: 'Patrícia A.',
        type: 'monthly' as const,
      })),
    ],
  },
  {
    id: 'ct3',
    name: 'Quadra Central',
    complexId: 'p2',
    dimensions: '9x18m',
    application: 'FTM Sports Center',
    hourlyRate: 140,
    monthlyRate: 520,
    slotOptions: defaultSlotOptions,
    reservations: [
      { date: today, start: '09:00', end: '10:00', user: 'Pedro M.' },
      { date: today, start: '19:00', end: '20:00', user: 'Carol R.', type: 'monthly' },
    ],
  },
  {
    id: 'ct4',
    name: 'Quadra 4',
    complexId: 'p2',
    dimensions: '9x18m',
    application: 'FTM Sports Center',
    hourlyRate: 110,
    monthlyRate: 390,
    slotOptions: defaultSlotOptions,
    reservations: [
      { date: today, start: '17:00', end: '18:00', user: 'Carla R.' },
    ],
  },
  {
    id: 'ct5',
    name: 'Arena 1',
    complexId: 'p3',
    dimensions: '8x16m',
    application: 'Contorno da Bola',
    hourlyRate: 95,
    monthlyRate: 340,
    slotOptions: defaultSlotOptions,
    reservations: [
      { date: today, start: '15:00', end: '16:00', user: 'Victor N.', type: 'monthly' },
    ],
  },
  {
    id: 'ct6',
    name: 'Arena 2',
    complexId: 'p3',
    dimensions: '10x20m',
    application: 'Contorno da Bola',
    hourlyRate: 90,
    monthlyRate: 320,
    slotOptions: defaultSlotOptions,
    reservations: [],
  },
  {
    id: 'ct7',
    name: 'Quadra Jurerê 1',
    complexId: 'p4',
    dimensions: '8x16m',
    application: 'Jurerê Beach Club',
    hourlyRate: 130,
    monthlyRate: 470,
    slotOptions: defaultSlotOptions,
    reservations: [
      { date: today, start: '11:00', end: '12:00', user: 'Brisa A.' },
    ],
  },
  {
    id: 'ct8',
    name: 'Quadra Jurerê 2',
    complexId: 'p4',
    dimensions: '9x18m',
    application: 'Jurerê Beach Club',
    hourlyRate: 115,
    monthlyRate: 410,
    slotOptions: defaultSlotOptions,
    reservations: [],
  },
];
