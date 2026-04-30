import type { Sport, Championship, ReservationPlace, User, Court, Team, ManagedPlayer } from '@/types';
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
  profiles: ['player', 'owner'],
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
};

export const MANAGED_PLAYERS: ManagedPlayer[] = [
  { id: 'pl1', name: 'Rafael Souza', email: 'rafa@jogajunto360.com', complexId: 'p2', sports: ['footvolley', 'beach-tennis'], level: 'intermediate' },
  { id: 'pl2', name: 'Sandrey Lima', email: 'sandrey@jogajunto360.com', complexId: 'p1', sports: ['footvolley'], level: 'professional' },
  { id: 'pl3', name: 'Brisa Almeida', email: 'brisa@jogajunto360.com', complexId: 'p1', sports: ['footvolley'], level: 'gold' },
  { id: 'pl4', name: 'Victor Nunes', email: 'victor@jogajunto360.com', complexId: 'p2', sports: ['footvolley', 'volleyball'], level: 'advanced' },
  { id: 'pl5', name: 'Carol Tavares', email: 'carol@jogajunto360.com', complexId: 'p4', sports: ['beach-tennis'], level: 'silver' },
  { id: 'pl6', name: 'Marina Costa', email: 'marina@jogajunto360.com', complexId: 'p4', sports: ['beach-tennis'], level: 'beginner' },
  { id: 'pl7', name: 'João Pedro', email: 'joao@jogajunto360.com', complexId: 'p3', sports: ['beach-soccer'], level: 'intermediate' },
  { id: 'pl8', name: 'Lucas Prado', email: 'lucas@jogajunto360.com', complexId: 'p3', sports: ['beach-soccer', 'footvolley'], level: 'advanced' },
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

export const RESERVATION_PLACES: ReservationPlace[] = [
  { id: 'p1', name: 'Arena Beach Copacabana', city: 'Rio de Janeiro', sports: ['footvolley', 'beach-tennis'], courts: 8, rating: 4.8, image: placeCopacabana },
  { id: 'p2', name: 'FTM Sports Center', city: 'São Paulo', sports: ['footvolley', 'volleyball'], courts: 12, rating: 4.9, image: placeFtm },
  { id: 'p3', name: 'Contorno da Bola', city: 'Belo Horizonte', sports: ['footvolley', 'beach-soccer'], courts: 6, rating: 4.7, image: placeContorno },
  { id: 'p4', name: 'Jurerê Beach Club', city: 'Florianópolis', sports: ['beach-tennis', 'volleyball'], courts: 10, rating: 4.9, image: placeJurere },
];

export const COURTS: Court[] = [
  { id: 'ct1', name: 'Court 1', sport: 'footvolley', application: 'FTM', reservations: [{ date: today, start: '08:00', end: '10:00', user: 'João S.' }, { date: today, start: '14:00', end: '16:00', user: 'Maria L.' }] },
  { id: 'ct2', name: 'Court 2', sport: 'footvolley', application: 'FTM', reservations: [{ date: today, start: '10:00', end: '12:00', user: 'Pedro M.' }] },
  { id: 'ct3', name: 'Court 3', sport: 'beach-tennis', application: 'Contorno da Bola', reservations: [] },
  { id: 'ct4', name: 'Court 4', sport: 'volleyball', application: 'FTM', reservations: [{ date: today, start: '18:00', end: '20:00', user: 'Carla R.' }] },
];
