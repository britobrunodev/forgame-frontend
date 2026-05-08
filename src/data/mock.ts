import type {
  Sport,
  Championship,
  ReservationPlace,
  User,
  Court,
  Team,
  ManagedPlayer,
  ManagedChampionship,
  ManagedCourtPayment,
  ManagedThirdPartyPayment,
  PaymentTransaction,
  ClassSlot,
} from "@/types";
import placeCopacabana from "@/assets/place-copacabana.jpg";
import placeFtm from "@/assets/place-ftm.jpg";
import placeContorno from "@/assets/place-contorno.jpg";
import placeJurere from "@/assets/place-jurere.jpg";
import champCopaRio from "@/assets/champ-copa-rio.jpg";
import champFloripa from "@/assets/champ-floripa.jpg";

export const SPORTS: Sport[] = [
  { id: "footvolley", name: "Footvolley", icon: "🏐" },
  { id: "beach-tennis", name: "Beach Tennis", icon: "🎾" },
  { id: "beach-soccer", name: "Futebol", icon: "⚽" },
  { id: "volleyball", name: "Volleyball", icon: "🏐" },
];

export const CURRENT_USER: User = {
  id: "u1",
  name: "Rafael Souza",
  email: "rafa@forgame.com.br",
  type: "player",
  profiles: ["player", "gestor"],
  gestorRoles: ["owner", "manager", "professor"],
  preferences: ["footvolley", "beach-tennis"],
  applications: ["FTM Sports Center", "Contorno da Bola"],
  country: "BR",
  phoneCountry: "BR",
  phoneNumber: "(21) 99876-5432",
  sportCharacteristics: {
    footvolley: ["left"],
    "beach-tennis": ["right"],
  },
  level: "beginner",
  wins: 0,
  losses: 0,
  draws: 0,
  ownedComplexIds: ["p2", "p3"],
};

export const MANAGED_PLAYERS: ManagedPlayer[] = [
  {
    id: "pl1",
    name: "Rafael Souza",
    email: "rafa@forgame.com.br",
    complexId: "p2",
    sports: ["footvolley", "beach-tennis"],
    level: "intermediate",
    score: 1240,
  },
  {
    id: "pl2",
    name: "Sandrey Lima",
    email: "sandrey@forgame.com.br",
    complexId: "p1",
    sports: ["footvolley"],
    level: "professional",
    score: 1860,
  },
  {
    id: "pl3",
    name: "Brisa Almeida",
    email: "brisa@forgame.com.br",
    complexId: "p1",
    sports: ["footvolley"],
    level: "high-advanced",
    score: 1620,
  },
  {
    id: "pl4",
    name: "Victor Nunes",
    email: "victor@forgame.com.br",
    complexId: "p2",
    sports: ["footvolley", "volleyball"],
    level: "advanced",
    score: 1410,
  },
  {
    id: "pl5",
    name: "Carol Tavares",
    email: "carol@forgame.com.br",
    complexId: "p4",
    sports: ["beach-tennis"],
    level: "high-intermediate",
    score: 1500,
  },
  {
    id: "pl6",
    name: "Marina Costa",
    email: "marina@forgame.com.br",
    complexId: "p4",
    sports: ["beach-tennis"],
    level: "beginner",
    score: 980,
  },
  {
    id: "pl7",
    name: "João Pedro",
    email: "joao@forgame.com.br",
    complexId: "p3",
    sports: ["beach-soccer"],
    level: "intermediate",
    score: 1180,
  },
  {
    id: "pl8",
    name: "Lucas Prado",
    email: "lucas@forgame.com.br",
    complexId: "p3",
    sports: ["beach-soccer", "footvolley"],
    level: "advanced",
    score: 1360,
  },
  { id: "pl9",  name: "Fernanda Rocha",   email: "fernanda@forgame.com.br",  complexId: "p2", sports: ["footvolley"],               level: "beginner",      score: 890  },
  { id: "pl10", name: "Thiago Cardoso",   email: "thiago@forgame.com.br",    complexId: "p2", sports: ["volleyball", "footvolley"], level: "intermediate",  score: 1150 },
  { id: "pl11", name: "Isabela Matos",    email: "isa@forgame.com.br",       complexId: "p3", sports: ["beach-soccer"],             level: "beginner",      score: 760  },
  { id: "pl12", name: "Rodrigo Ferreira", email: "rodrigo@forgame.com.br",   complexId: "p3", sports: ["footvolley", "beach-soccer"], level: "high-advanced",        score: 1720 },
  { id: "pl13", name: "Camila Duarte",    email: "camila@forgame.com.br",    complexId: "p2", sports: ["footvolley"],               level: "high-intermediate",        score: 1530 },
  { id: "pl14", name: "André Fonseca",    email: "andre@forgame.com.br",     complexId: "p3", sports: ["beach-soccer"],             level: "advanced",      score: 1420 },
  { id: "pl15", name: "Patrícia Mendes",  email: "patricia@forgame.com.br",  complexId: "p2", sports: ["volleyball"],               level: "intermediate",  score: 1080 },
  { id: "pl16", name: "Felipe Azevedo",   email: "felipe@forgame.com.br",    complexId: "p3", sports: ["footvolley", "beach-soccer"], level: "professional", score: 1930 },
  { id: "pl17", name: "Mariana Teixeira", email: "mariana@forgame.com.br",   complexId: "p2", sports: ["footvolley"],               level: "beginner",      score: 840  },
  { id: "pl18", name: "Gustavo Lopes",    email: "gustavo@forgame.com.br",   complexId: "p3", sports: ["beach-soccer"],             level: "intermediate",  score: 1270 },
  { id: "pl19", name: "Juliana Barros",   email: "juliana@forgame.com.br",   complexId: "p2", sports: ["volleyball", "footvolley"], level: "advanced",      score: 1390 },
  { id: "pl20", name: "Eduardo Cunha",    email: "eduardo@forgame.com.br",   complexId: "p3", sports: ["footvolley"],               level: "high-intermediate",        score: 1560 },
  { id: "pl21", name: "Larissa Vieira",   email: "larissa@forgame.com.br",   complexId: "p1", sports: ["beach-tennis"],             level: "high-advanced",          score: 1680 },
  { id: "pl22", name: "Bruno Monteiro",   email: "bmont@forgame.com.br",     complexId: "p1", sports: ["footvolley"],               level: "intermediate",  score: 1200 },
  { id: "pl23", name: "Natália Campos",   email: "natalia@forgame.com.br",   complexId: "p4", sports: ["beach-tennis"],             level: "high-intermediate",        score: 1510 },
  { id: "pl24", name: "Diego Santana",    email: "diego@forgame.com.br",     complexId: "p4", sports: ["beach-tennis", "volleyball"], level: "advanced",    score: 1440 },
  { id: "pl25", name: "Aline Ribeiro",    email: "aline@forgame.com.br",     complexId: "p2", sports: ["footvolley"],               level: "beginner",      score: 910  },
];

export const FRIENDS = [
  {
    id: "fr1",
    name: "Brisa",
    handle: "@brisa",
    sport: "footvolley" as const,
    status: "Live em Copacabana",
    image: champCopaRio,
  },
  {
    id: "fr2",
    name: "Carol",
    handle: "@carolt",
    sport: "beach-tennis" as const,
    status: "Treino em Floripa",
    image: champFloripa,
  },
  {
    id: "fr3",
    name: "Victor",
    handle: "@victorn",
    sport: "footvolley" as const,
    status: "Classificado",
    image: placeFtm,
  },
  {
    id: "fr4",
    name: "João",
    handle: "@joaopedro",
    sport: "beach-soccer" as const,
    status: "Reserva confirmada",
    image: placeContorno,
  },
];

export const SOCIAL_FEED = [
  {
    id: "post1",
    author: "Forgame",
    role: "Arena Update",
    image: champCopaRio,
    title: "Copa Rio Footvolley 2026 já está ao vivo",
    body: "A quadra principal em Copacabana já abriu com jogos da chave profissional e transmissão rolando direto pelo app.",
    metricA: "1.2k views",
    metricB: "84 comments",
  },
  {
    id: "post2",
    author: "Brisa Almeida",
    role: "Friend Activity",
    image: champFloripa,
    title: "Brisa entrou no Beach Tennis Open Floripa",
    body: "Sua amiga acabou de confirmar a inscrição na categoria Ouro e está montando dupla para sábado.",
    metricA: "36 likes",
    metricB: "12 comments",
  },
  {
    id: "post3",
    author: "FTM Sports Center",
    role: "Complex Highlight",
    image: placeFtm,
    title: "Quadras abertas para amistosos de sexta",
    body: "O complexo liberou novas janelas para reservas noturnas e abriu lista de espera para professores.",
    metricA: "18 saves",
    metricB: "9 shares",
  },
];

const roundNameByTeamCount: Record<number, string> = {
  32: "Round of 32",
  16: "Round of 16",
  8: "Quarter-finals",
  4: "Semi-finals",
  2: "Final",
};

const getWinner = (
  status: "scheduled" | "live" | "finished",
  scoreA?: number,
  scoreB?: number,
  teamA?: Team | null,
  teamB?: Team | null,
) => {
  if (
    status !== "finished" ||
    !teamA ||
    !teamB ||
    scoreA === undefined ||
    scoreB === undefined
  )
    return null;
  return scoreA >= scoreB ? teamA : teamB;
};

const buildBracket = (teams: string[]) => {
  let currentTeams: Array<Team | null> = teams.map((name, index) => ({
    id: `team-${index + 1}`,
    name,
    seed: index + 1,
  }));
  const rounds: Championship["rounds"] = [];
  let roundIndex = 0;

  while (currentTeams.length >= 2) {
    const roundName =
      roundNameByTeamCount[currentTeams.length] ??
      `Round of ${currentTeams.length}`;
    const matches: Championship["rounds"][number]["matches"] = [];
    const nextTeams: Array<Team | null> = [];

    for (let i = 0; i < currentTeams.length; i += 2) {
      const teamA = currentTeams[i] ?? null;
      const teamB = currentTeams[i + 1] ?? null;
      const matchNumber = i / 2;
      const isFirstRound = roundIndex === 0;
      const status = isFirstRound
        ? matchNumber < 4
          ? "finished"
          : matchNumber < 8
            ? "live"
            : "scheduled"
        : "scheduled";
      const scoreA =
        status === "finished" ? 18 : status === "live" ? 12 : undefined;
      const scoreB =
        status === "finished" ? 14 : status === "live" ? 12 : undefined;
      const setScoreA =
        status === "finished" ? 2 : status === "live" ? 1 : undefined;
      const setScoreB =
        status === "finished" ? 1 : status === "live" ? 1 : undefined;

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
const reservationWindowDates = Array.from({ length: 5 }, (_, index) =>
  addDays(today, index),
);
const defaultSlotOptions = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
  { start: "17:00", end: "18:00" },
  { start: "18:00", end: "19:00" },
  { start: "19:00", end: "20:00" },
];

export const CHAMPIONSHIPS: Championship[] = [
  {
    id: "c1",
    name: "Copa Rio Footvolley 2026",
    sport: "footvolley",
    location: "Praia de Copacabana, RJ",
    startDate: today,
    endDate: today,
    teamsCount: 32,
    status: "live",
    banner: undefined,
    image: champCopaRio,
    prize: "R$ 50.000",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    format: "double",
    entryFee: 150,
    complexId: "p1",
    categories: [
      {
        id: "c1-cat1",
        name: "Open Masculino",
        format: "double",
        entryFee: 150,
      },
      { id: "c1-cat2", name: "Misto", format: "double", entryFee: 120 },
      { id: "c1-cat3", name: "Cumbuca", format: "cumbuca", entryFee: 80 },
    ],
    rounds: buildBracket([
      "Sandrey & Brisa",
      "Dioguinho & Giovani",
      "Victor & Thierry",
      "Aguia & Bruninho",
      "Longo & Michel",
      "Bruno B. & Kibinho",
      "Gui & Juninho",
      "Renan & Neguinho",
      "Vitinho & Paraná",
      "Chau & Thallys",
      "Saldanha & Juninho",
      "Hiltinho & Franklin",
      "Biel & Pablo",
      "Dudu & Arthur",
      "Leo & Eduzinho",
      "Indio & Felipe",
      "Japa & Murilo",
      "Ryan & Felipe",
      "Gui Neto & Pedrinho",
      "Marquinhos & Davi",
      "Parazinho & Ruan",
      "Lucas & Junin",
      "Mateus & Cassio",
      "Daniel & Guto",
      "Neto & Beto",
      "Tavinho & JP",
      "Luan & Nino",
      "Kaue & Erick",
      "Pablo & Cesar",
      "Joao Pedro & Lipe",
      "Galego & Raul",
      "Breno & Natan",
    ]),
  },
  {
    id: "c2",
    name: "Beach Tennis Open Floripa",
    sport: "beach-tennis",
    location: "Jurerê Internacional, SC",
    startDate: today,
    endDate: today,
    teamsCount: 32,
    status: "live",
    banner: undefined,
    image: champFloripa,
    prize: "R$ 30.000",
    youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    format: "cumbuca",
    entryFee: 120,
    complexId: "p4",
    categories: [
      { id: "c2-cat1", name: "Ouro", format: "cumbuca", entryFee: 120 },
      { id: "c2-cat2", name: "Prata", format: "cumbuca", entryFee: 100 },
      { id: "c2-cat3", name: "Bronze", format: "cumbuca", entryFee: 80 },
    ],
    rounds: buildBracket([
      "Carol & Bia",
      "Mari & Lu",
      "Ana & Duda",
      "Leticia & Sofia",
      "Paula & Nina",
      "Helena & Vivi",
      "Clara & Manu",
      "Joana & Raquel",
      "Camila & Bruna",
      "Larissa & Tati",
      "Isa & Gabi",
      "Carla & Fernanda",
      "Yasmin & Dani",
      "Patricia & Karen",
      "Renata & Aline",
      "Juliana & Roberta",
      "Bella & Ju",
      "Malu & Teca",
      "Lara & Carol",
      "Taina & Livia",
      "Debora & Priscila",
      "Rita & Bea",
      "Paola & Cris",
      "Mirela & Cami",
      "Alice & Manuella",
      "Nina & Paula",
      "Tata & Ellen",
      "Valen & Caca",
      "Rafa & Dri",
      "Ester & Marih",
      "Nath & Gi",
      "Bela & Lais",
    ]),
  },
  {
    id: "c3",
    name: "Liga Nacional de Footvolley",
    sport: "footvolley",
    location: "São Paulo, SP",
    startDate: "2026-05-12",
    endDate: "2026-05-20",
    teamsCount: 32,
    status: "upcoming",
    banner: undefined,
    prize: "R$ 80.000",
    youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    format: "double",
    entryFee: 200,
    complexId: "p2",
    categories: [
      { id: "c3-cat1", name: "Profissional", format: "double", entryFee: 200 },
      { id: "c3-cat2", name: "Amador", format: "double", entryFee: 150 },
      {
        id: "c3-cat3",
        name: "Rei da Praia",
        format: "rei-da-praia",
        entryFee: 80,
      },
    ],
    rounds: buildBracket(Array.from({ length: 32 }, (_, i) => `Team ${i + 1}`)),
  },
  {
    id: "c4",
    name: "Copa Futebol",
    sport: "beach-soccer",
    location: "Recife, PE",
    startDate: "2026-05-05",
    endDate: "2026-05-08",
    teamsCount: 32,
    status: "upcoming",
    banner: undefined,
    format: "rei-da-praia",
    entryFee: 80,
    complexId: "p3",
    categories: [
      {
        id: "c4-cat1",
        name: "Rei da Praia",
        format: "rei-da-praia",
        entryFee: 80,
      },
      { id: "c4-cat2", name: "Sub-20", format: "rei-da-praia", entryFee: 60 },
    ],
    rounds: buildBracket(
      Array.from({ length: 32 }, (_, i) => `Squad ${i + 1}`),
    ),
  },
];

export const MANAGED_CHAMPIONSHIPS: ManagedChampionship[] = [
  {
    id: "mc1",
    complexId: "p2",
    name: "Liga Nacional de Footvolley",
    sport: "footvolley",
    startDate: "2026-05-12",
    endDate: "2026-05-20",
    teamsCount: 32,
    status: "upcoming",
    image: placeFtm,
    payments: [
      {
        userId: "pl1",
        userName: "Rafael Souza",
        userEmail: "rafa@forgame.com.br",
        totalAmount: 180,
        paidAmount: 180,
        remainingAmount: 0,
        status: "paid",
        transactions: [
          {
            id: "txn-1001",
            reference: "PIX-88124",
            amount: 180,
            method: "pix",
            paidAt: "2026-05-03 10:14",
            status: "paid",
          },
        ],
      },
      {
        userId: "pl4",
        userName: "Victor Nunes",
        userEmail: "victor@forgame.com.br",
        totalAmount: 180,
        paidAmount: 90,
        remainingAmount: 90,
        status: "pending",
        transactions: [
          {
            id: "txn-1002",
            reference: "CARD-22017",
            amount: 90,
            method: "credit-card",
            paidAt: "2026-05-04 18:11",
            status: "failed",
          },
          {
            id: "txn-1003",
            reference: "CARD-22018",
            amount: 90,
            method: "credit-card",
            paidAt: "2026-05-04 18:32",
            status: "paid",
          },
          {
            id: "txn-1004",
            reference: "OPEN-22019",
            amount: 90,
            method: "pay-on-site",
            paidAt: "2026-05-12 08:00",
            status: "pending",
          },
        ],
      },
    ],
  },
  {
    id: "mc2",
    complexId: "p3",
    name: "Copa Futebol",
    sport: "beach-soccer",
    startDate: "2026-05-05",
    endDate: "2026-05-08",
    teamsCount: 32,
    status: "upcoming",
    image: placeContorno,
    payments: [
      {
        userId: "pl7",
        userName: "João Pedro",
        userEmail: "joao@forgame.com.br",
        totalAmount: 140,
        paidAmount: 140,
        remainingAmount: 0,
        status: "paid",
        transactions: [
          {
            id: "txn-1005",
            reference: "DEBIT-11882",
            amount: 140,
            method: "debit-card",
            paidAt: "2026-04-29 09:42",
            status: "paid",
          },
        ],
      },
      {
        userId: "pl8",
        userName: "Lucas Prado",
        userEmail: "lucas@forgame.com.br",
        totalAmount: 140,
        paidAmount: 0,
        remainingAmount: 140,
        status: "pending",
        transactions: [
          {
            id: "txn-1006",
            reference: "PIX-33000",
            amount: 140,
            method: "pix",
            paidAt: "2026-04-28 17:06",
            status: "failed",
          },
          {
            id: "txn-1007",
            reference: "OPEN-33001",
            amount: 140,
            method: "pay-on-site",
            paidAt: "2026-05-05 07:30",
            status: "pending",
          },
        ],
      },
    ],
  },
  {
    id: "mc3",
    complexId: "p2",
    name: "FTM Winter Cup",
    sport: "volleyball",
    startDate: "2026-04-30",
    endDate: "2026-05-01",
    teamsCount: 16,
    status: "live",
    image: placeFtm,
    payments: [
      {
        userId: "pl9",
        userName: "Marina Lopes",
        userEmail: "marina.lopes@forgame.com.br",
        totalAmount: 220,
        paidAmount: 220,
        remainingAmount: 0,
        status: "paid",
        transactions: [
          {
            id: "txn-1008",
            reference: "PIX-11923",
            amount: 220,
            method: "pix",
            paidAt: "2026-04-26 16:08",
            status: "paid",
          },
        ],
      },
    ],
  },
  {
    id: "mc4",
    complexId: "p3",
    name: "Open Contorno 2026",
    sport: "footvolley",
    startDate: "2026-03-10",
    endDate: "2026-03-12",
    teamsCount: 24,
    status: "finished",
    image: placeContorno,
    payments: [
      {
        userId: "pl10",
        userName: "Bruno Teixeira",
        userEmail: "bruno.teixeira@forgame.com.br",
        totalAmount: 160,
        paidAmount: 160,
        remainingAmount: 0,
        status: "paid",
        transactions: [
          {
            id: "txn-1009",
            reference: "CARD-99210",
            amount: 80,
            method: "credit-card",
            paidAt: "2026-02-22 13:11",
            status: "paid",
          },
          {
            id: "txn-1010",
            reference: "CARD-99258",
            amount: 80,
            method: "credit-card",
            paidAt: "2026-03-01 11:20",
            status: "paid",
          },
        ],
      },
      {
        userId: "pl11",
        userName: "César Moura",
        userEmail: "cesar.moura@forgame.com.br",
        totalAmount: 160,
        paidAmount: 160,
        remainingAmount: 0,
        status: "paid",
        transactions: [
          {
            id: "txn-1011",
            reference: "PIX-44281",
            amount: 160,
            method: "pix",
            paidAt: "2026-02-25 08:45",
            status: "paid",
          },
        ],
      },
    ],
  },
];

export const MANAGED_COURT_PAYMENTS: ManagedCourtPayment[] = [
  {
    id: "cp1",
    complexId: "p2",
    courtId: "ct3",
    courtName: "Quadra Central",
    reservationDate: today,
    timeSlot: "09:00 - 10:00",
    userId: "pl1",
    userName: "Rafael Souza",
    userEmail: "rafa@forgame.com.br",
    totalAmount: 140,
    paidAmount: 140,
    remainingAmount: 0,
    status: "paid",
    transactions: [
      {
        id: "ctx-2001",
        reference: "PIX-71221",
        amount: 140,
        method: "pix",
        paidAt: "2026-04-29 08:21",
        status: "paid",
      },
    ],
  },
  {
    id: "cp2",
    complexId: "p2",
    courtId: "ct4",
    courtName: "Quadra 4",
    reservationDate: today,
    timeSlot: "17:00 - 18:00",
    userId: "pl4",
    userName: "Victor Nunes",
    userEmail: "victor@forgame.com.br",
    totalAmount: 110,
    paidAmount: 110,
    remainingAmount: 0,
    status: "paid",
    transactions: [
      {
        id: "ctx-2002",
        reference: "CARD-22077",
        amount: 110,
        method: "credit-card",
        paidAt: "2026-04-29 16:02",
        status: "failed",
      },
      {
        id: "ctx-2003",
        reference: "CARD-22078",
        amount: 110,
        method: "credit-card",
        paidAt: "2026-04-29 16:07",
        status: "paid",
      },
    ],
  },
  {
    id: "cp3",
    complexId: "p3",
    courtId: "ct5",
    courtName: "Arena 1",
    reservationDate: today,
    timeSlot: "15:00 - 16:00",
    userId: "pl7",
    userName: "João Pedro",
    userEmail: "joao@forgame.com.br",
    totalAmount: 95,
    paidAmount: 0,
    remainingAmount: 95,
    status: "pending",
    transactions: [
      {
        id: "ctx-2004",
        reference: "PIX-88311",
        amount: 95,
        method: "pix",
        paidAt: "2026-04-30 09:12",
        status: "failed",
      },
      {
        id: "ctx-2005",
        reference: "OPEN-88312",
        amount: 95,
        method: "pay-on-site",
        paidAt: "2026-04-30 15:00",
        status: "pending",
      },
    ],
  },
  {
    id: "cp4",
    complexId: "p3",
    courtId: "ct6",
    courtName: "Arena 2",
    reservationDate: addDays(today, 1),
    timeSlot: "18:00 - 19:00",
    userId: "pl8",
    userName: "Lucas Prado",
    userEmail: "lucas@forgame.com.br",
    totalAmount: 110,
    paidAmount: 110,
    remainingAmount: 0,
    status: "paid",
    transactions: [{ id: "ctx-2006", reference: "DEBIT-44102", amount: 110, method: "debit-card", paidAt: "2026-04-30 10:43", status: "paid" }],
  },
  { id: "cp5",  complexId: "p2", courtId: "ct3", courtName: "Quadra Central", reservationDate: addDays(today, -1), timeSlot: "07:00 - 08:00", userId: "pl9",  userName: "Fernanda Rocha",   userEmail: "fernanda@forgame.com.br", totalAmount: 140, paidAmount: 140, remainingAmount: 0,   status: "paid",    transactions: [{ id: "ctx-2010", reference: "PIX-10001", amount: 140, method: "pix",         paidAt: "2026-05-01 06:50", status: "paid"    }] },
  { id: "cp6",  complexId: "p2", courtId: "ct4", courtName: "Quadra 4",       reservationDate: addDays(today, -1), timeSlot: "10:00 - 11:00", userId: "pl10", userName: "Thiago Cardoso",   userEmail: "thiago@forgame.com.br",  totalAmount: 110, paidAmount: 55,  remainingAmount: 55,  status: "pending", transactions: [{ id: "ctx-2011", reference: "CARD-10002", amount: 55,  method: "credit-card", paidAt: "2026-05-01 09:30", status: "paid"    }] },
  { id: "cp7",  complexId: "p3", courtId: "ct5", courtName: "Arena 1",        reservationDate: addDays(today, -2), timeSlot: "14:00 - 15:00", userId: "pl11", userName: "Isabela Matos",    userEmail: "isa@forgame.com.br",     totalAmount: 95,  paidAmount: 0,   remainingAmount: 95,  status: "pending", transactions: [{ id: "ctx-2012", reference: "PIX-10003", amount: 95,  method: "pix",         paidAt: "2026-04-30 13:00", status: "failed"  }] },
  { id: "cp8",  complexId: "p3", courtId: "ct6", courtName: "Arena 2",        reservationDate: addDays(today, -2), timeSlot: "16:00 - 17:00", userId: "pl12", userName: "Rodrigo Ferreira", userEmail: "rodrigo@forgame.com.br", totalAmount: 95,  paidAmount: 95,  remainingAmount: 0,   status: "paid",    transactions: [{ id: "ctx-2013", reference: "PIX-10004", amount: 95,  method: "pix",         paidAt: "2026-04-30 15:45", status: "paid"    }] },
  { id: "cp9",  complexId: "p2", courtId: "ct3", courtName: "Quadra Central", reservationDate: addDays(today, -3), timeSlot: "08:00 - 09:00", userId: "pl13", userName: "Camila Duarte",    userEmail: "camila@forgame.com.br",  totalAmount: 140, paidAmount: 140, remainingAmount: 0,   status: "paid",    transactions: [{ id: "ctx-2014", reference: "DEBIT-10005", amount: 140, method: "debit-card", paidAt: "2026-04-29 07:55", status: "paid"    }] },
  { id: "cp10", complexId: "p2", courtId: "ct4", courtName: "Quadra 4",       reservationDate: addDays(today, -3), timeSlot: "19:00 - 20:00", userId: "pl15", userName: "Patrícia Mendes",  userEmail: "patricia@forgame.com.br", totalAmount: 110, paidAmount: 110, remainingAmount: 0,  status: "paid",    transactions: [{ id: "ctx-2015", reference: "CARD-10006", amount: 110, method: "credit-card", paidAt: "2026-04-29 18:40", status: "paid"    }] },
  { id: "cp11", complexId: "p3", courtId: "ct5", courtName: "Arena 1",        reservationDate: addDays(today, -4), timeSlot: "09:00 - 10:00", userId: "pl14", userName: "André Fonseca",    userEmail: "andre@forgame.com.br",   totalAmount: 95,  paidAmount: 95,  remainingAmount: 0,   status: "paid",    transactions: [{ id: "ctx-2016", reference: "PIX-10007", amount: 95,  method: "pix",         paidAt: "2026-04-28 08:50", status: "paid"    }] },
  { id: "cp12", complexId: "p2", courtId: "ct3", courtName: "Quadra Central", reservationDate: addDays(today, -4), timeSlot: "11:00 - 12:00", userId: "pl17", userName: "Mariana Teixeira", userEmail: "mariana@forgame.com.br", totalAmount: 140, paidAmount: 0,   remainingAmount: 140, status: "pending", transactions: [{ id: "ctx-2017", reference: "PIX-10008", amount: 140, method: "pix",         paidAt: "2026-04-28 10:30", status: "failed"  }] },
  { id: "cp13", complexId: "p3", courtId: "ct6", courtName: "Arena 2",        reservationDate: addDays(today, -5), timeSlot: "17:00 - 18:00", userId: "pl16", userName: "Felipe Azevedo",   userEmail: "felipe@forgame.com.br",  totalAmount: 95,  paidAmount: 95,  remainingAmount: 0,   status: "paid",    transactions: [{ id: "ctx-2018", reference: "PIX-10009", amount: 95,  method: "pix",         paidAt: "2026-04-27 16:55", status: "paid"    }] },
  { id: "cp14", complexId: "p2", courtId: "ct4", courtName: "Quadra 4",       reservationDate: addDays(today, -5), timeSlot: "13:00 - 14:00", userId: "pl19", userName: "Juliana Barros",   userEmail: "juliana@forgame.com.br", totalAmount: 110, paidAmount: 110, remainingAmount: 0,   status: "paid",    transactions: [{ id: "ctx-2019", reference: "CARD-10010", amount: 110, method: "credit-card", paidAt: "2026-04-27 12:50", status: "paid"    }] },
  { id: "cp15", complexId: "p3", courtId: "ct5", courtName: "Arena 1",        reservationDate: addDays(today, -6), timeSlot: "10:00 - 11:00", userId: "pl18", userName: "Gustavo Lopes",    userEmail: "gustavo@forgame.com.br", totalAmount: 95,  paidAmount: 95,  remainingAmount: 0,   status: "paid",    transactions: [{ id: "ctx-2020", reference: "PIX-10011", amount: 95,  method: "pix",         paidAt: "2026-04-26 09:45", status: "paid"    }] },
  { id: "cp16", complexId: "p2", courtId: "ct3", courtName: "Quadra Central", reservationDate: addDays(today, -6), timeSlot: "15:00 - 16:00", userId: "pl20", userName: "Eduardo Cunha",    userEmail: "eduardo@forgame.com.br", totalAmount: 140, paidAmount: 140, remainingAmount: 0,   status: "paid",    transactions: [{ id: "ctx-2021", reference: "PIX-10012", amount: 140, method: "pix",         paidAt: "2026-04-26 14:55", status: "paid"    }] },
];

export const RESERVATION_PLACES: ReservationPlace[] = [
  {
    id: "p1",
    name: "Arena Beach Copacabana",
    city: "Rio de Janeiro",
    sports: ["footvolley", "beach-tennis"],
    courts: 8,
    rating: 4.8,
    image: placeCopacabana,
  },
  {
    id: "p2",
    name: "FTM Sports Center",
    city: "São Paulo",
    sports: ["footvolley", "volleyball"],
    courts: 12,
    rating: 4.9,
    image: placeFtm,
  },
  {
    id: "p3",
    name: "Contorno da Bola",
    city: "Belo Horizonte",
    sports: ["footvolley", "beach-soccer"],
    courts: 6,
    rating: 4.7,
    image: placeContorno,
  },
  {
    id: "p4",
    name: "Jurerê Beach Club",
    city: "Florianópolis",
    sports: ["beach-tennis", "volleyball"],
    courts: 10,
    rating: 4.9,
    image: placeJurere,
  },
];

export const MANAGED_THIRD_PARTY_PAYMENTS: ManagedThirdPartyPayment[] = [
  {
    id: "wh1",
    complexId: "p2",
    sourceType: "wellhub",
    userName: "Ana Costa",
    userEmail: "ana.costa@wellhub.com",
    date: "2026-04-28",
    totalAmount: 85,
    paidAmount: 85,
    remainingAmount: 0,
    status: "paid",
    transactions: [
      {
        id: "wh-txn-1",
        reference: "WELLHUB-00123",
        amount: 85,
        method: "pix",
        paidAt: "2026-04-28 14:30",
        status: "paid",
      },
    ],
  },
  {
    id: "wh2",
    complexId: "p2",
    sourceType: "wellhub",
    userName: "Carlos Mendes",
    userEmail: "carlos.mendes@wellhub.com",
    date: "2026-04-29",
    totalAmount: 120,
    paidAmount: 60,
    remainingAmount: 60,
    status: "pending",
    transactions: [
      {
        id: "wh-txn-2",
        reference: "WELLHUB-00124",
        amount: 60,
        method: "credit-card",
        paidAt: "2026-04-29 10:15",
        status: "paid",
      },
      {
        id: "wh-txn-3",
        reference: "WELLHUB-00125",
        amount: 60,
        method: "pix",
        paidAt: "2026-04-30 09:00",
        status: "pending",
      },
    ],
  },
  {
    id: "tp1",
    complexId: "p3",
    sourceType: "totalpass",
    userName: "Beatriz Lima",
    userEmail: "beatriz.lima@totalpass.com",
    date: "2026-04-27",
    totalAmount: 75,
    paidAmount: 75,
    remainingAmount: 0,
    status: "paid",
    transactions: [
      {
        id: "tp-txn-1",
        reference: "TOTALPASS-55001",
        amount: 75,
        method: "pix",
        paidAt: "2026-04-27 16:45",
        status: "paid",
      },
    ],
  },
  {
    id: "tp2",
    complexId: "p3",
    sourceType: "totalpass",
    userName: "Daniel Rocha",
    userEmail: "daniel.rocha@totalpass.com",
    date: "2026-04-30",
    totalAmount: 95,
    paidAmount: 0,
    remainingAmount: 95,
    status: "pending",
    transactions: [{ id: "tp-txn-2", reference: "TOTALPASS-55002", amount: 95, method: "credit-card", paidAt: "2026-04-30 11:20", status: "failed" }],
  },
  { id: "wh3",  complexId: "p2", sourceType: "wellhub",    userName: "Fernanda Rocha",   userEmail: "fernanda@forgame.com.br",  date: "2026-04-27", totalAmount: 85,  paidAmount: 85,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "wh-txn-3",   reference: "WELLHUB-00130",   amount: 85,  method: "pix",         paidAt: "2026-04-27 10:00", status: "paid"   }] },
  { id: "wh4",  complexId: "p2", sourceType: "wellhub",    userName: "Thiago Cardoso",   userEmail: "thiago@forgame.com.br",   date: "2026-04-26", totalAmount: 85,  paidAmount: 85,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "wh-txn-4",   reference: "WELLHUB-00131",   amount: 85,  method: "pix",         paidAt: "2026-04-26 09:15", status: "paid"   }] },
  { id: "wh5",  complexId: "p3", sourceType: "wellhub",    userName: "André Fonseca",    userEmail: "andre@forgame.com.br",    date: "2026-04-25", totalAmount: 85,  paidAmount: 0,   remainingAmount: 85, status: "pending", transactions: [{ id: "wh-txn-5",   reference: "WELLHUB-00132",   amount: 85,  method: "credit-card", paidAt: "2026-04-25 14:30", status: "failed" }] },
  { id: "wh6",  complexId: "p2", sourceType: "wellhub",    userName: "Patrícia Mendes",  userEmail: "patricia@forgame.com.br", date: "2026-04-24", totalAmount: 85,  paidAmount: 85,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "wh-txn-6",   reference: "WELLHUB-00133",   amount: 85,  method: "pix",         paidAt: "2026-04-24 11:00", status: "paid"   }] },
  { id: "tp3",  complexId: "p3", sourceType: "totalpass",  userName: "Isabela Matos",    userEmail: "isa@forgame.com.br",      date: "2026-04-29", totalAmount: 75,  paidAmount: 75,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "tp-txn-3",   reference: "TOTALPASS-55003", amount: 75,  method: "pix",         paidAt: "2026-04-29 09:00", status: "paid"   }] },
  { id: "tp4",  complexId: "p2", sourceType: "totalpass",  userName: "Camila Duarte",    userEmail: "camila@forgame.com.br",   date: "2026-04-28", totalAmount: 75,  paidAmount: 75,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "tp-txn-4",   reference: "TOTALPASS-55004", amount: 75,  method: "debit-card",  paidAt: "2026-04-28 08:40", status: "paid"   }] },
  { id: "tp5",  complexId: "p3", sourceType: "totalpass",  userName: "Gustavo Lopes",    userEmail: "gustavo@forgame.com.br",  date: "2026-04-27", totalAmount: 95,  paidAmount: 95,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "tp-txn-5",   reference: "TOTALPASS-55005", amount: 95,  method: "pix",         paidAt: "2026-04-27 16:00", status: "paid"   }] },
  { id: "tp6",  complexId: "p2", sourceType: "totalpass",  userName: "Mariana Teixeira", userEmail: "mariana@forgame.com.br",  date: "2026-04-26", totalAmount: 75,  paidAmount: 0,   remainingAmount: 75, status: "pending", transactions: [{ id: "tp-txn-6",   reference: "TOTALPASS-55006", amount: 75,  method: "pix",         paidAt: "2026-04-26 15:10", status: "failed" }] },
  { id: "wh7",  complexId: "p3", sourceType: "wellhub",    userName: "Rodrigo Ferreira", userEmail: "rodrigo@forgame.com.br",  date: "2026-04-23", totalAmount: 85,  paidAmount: 85,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "wh-txn-7",   reference: "WELLHUB-00140",   amount: 85,  method: "pix",         paidAt: "2026-04-23 10:30", status: "paid"   }] },
  { id: "wh8",  complexId: "p2", sourceType: "wellhub",    userName: "Felipe Azevedo",   userEmail: "felipe@forgame.com.br",   date: "2026-04-22", totalAmount: 85,  paidAmount: 85,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "wh-txn-8",   reference: "WELLHUB-00141",   amount: 85,  method: "credit-card", paidAt: "2026-04-22 09:00", status: "paid"   }] },
  { id: "tp7",  complexId: "p3", sourceType: "totalpass",  userName: "Juliana Barros",   userEmail: "juliana@forgame.com.br",  date: "2026-04-21", totalAmount: 95,  paidAmount: 95,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "tp-txn-7",   reference: "TOTALPASS-55010", amount: 95,  method: "pix",         paidAt: "2026-04-21 14:45", status: "paid"   }] },
  { id: "tp8",  complexId: "p2", sourceType: "totalpass",  userName: "Eduardo Cunha",    userEmail: "eduardo@forgame.com.br",  date: "2026-04-20", totalAmount: 75,  paidAmount: 75,  remainingAmount: 0,  status: "paid",    transactions: [{ id: "tp-txn-8",   reference: "TOTALPASS-55011", amount: 75,  method: "debit-card",  paidAt: "2026-04-20 11:20", status: "paid"   }] },
];

export const COURTS: Court[] = [
  {
    id: "ct1",
    name: "Quadra 1",
    complexId: "p1",
    dimensions: "9x18m",
    application: "Arena Beach Copacabana",
    hourlyRate: 120,
    monthlyRate: 420,
    slotOptions: defaultSlotOptions,
    reservations: [
      { date: today, start: "08:00", end: "09:00", user: "João S." },
      ...reservationWindowDates.map((date) => ({
        date,
        start: "18:00",
        end: "19:00",
        user: "Maria L.",
        type: "monthly" as const,
      })),
    ],
  },
  {
    id: "ct2",
    name: "Quadra 2",
    complexId: "p1",
    dimensions: "8x16m",
    application: "Arena Beach Copacabana",
    hourlyRate: 100,
    monthlyRate: 360,
    slotOptions: defaultSlotOptions,
    reservations: [
      ...reservationWindowDates.map((date) => ({
        date,
        start: "10:00",
        end: "11:00",
        user: "Patrícia A.",
        type: "monthly" as const,
      })),
    ],
  },
  {
    id: "ct3",
    name: "Quadra Central",
    complexId: "p2",
    dimensions: "9x18m",
    application: "FTM Sports Center",
    hourlyRate: 140,
    monthlyRate: 520,
    slotOptions: defaultSlotOptions,
    reservations: [
      { date: today, start: "09:00", end: "10:00", user: "Pedro M." },
      {
        date: today,
        start: "19:00",
        end: "20:00",
        user: "Carol R.",
        type: "monthly",
      },
    ],
  },
  {
    id: "ct4",
    name: "Quadra 4",
    complexId: "p2",
    dimensions: "9x18m",
    application: "FTM Sports Center",
    hourlyRate: 110,
    monthlyRate: 390,
    slotOptions: defaultSlotOptions,
    reservations: [
      { date: today, start: "17:00", end: "18:00", user: "Carla R." },
    ],
  },
  {
    id: "ct5",
    name: "Arena 1",
    complexId: "p3",
    dimensions: "8x16m",
    application: "Contorno da Bola",
    hourlyRate: 95,
    monthlyRate: 340,
    slotOptions: defaultSlotOptions,
    reservations: [
      {
        date: today,
        start: "15:00",
        end: "16:00",
        user: "Victor N.",
        type: "monthly",
      },
    ],
  },
  {
    id: "ct6",
    name: "Arena 2",
    complexId: "p3",
    dimensions: "10x20m",
    application: "Contorno da Bola",
    hourlyRate: 90,
    monthlyRate: 320,
    slotOptions: defaultSlotOptions,
    reservations: [],
  },
  {
    id: "ct7",
    name: "Quadra Jurerê 1",
    complexId: "p4",
    dimensions: "8x16m",
    application: "Jurerê Beach Club",
    hourlyRate: 130,
    monthlyRate: 470,
    slotOptions: defaultSlotOptions,
    reservations: [
      { date: today, start: "11:00", end: "12:00", user: "Brisa A." },
    ],
  },
  {
    id: "ct8",
    name: "Quadra Jurerê 2",
    complexId: "p4",
    dimensions: "9x18m",
    application: "Jurerê Beach Club",
    hourlyRate: 115,
    monthlyRate: 410,
    slotOptions: defaultSlotOptions,
    reservations: [],
  },
];

const d0 = today;
const d1 = addDays(today, 1);
const d2 = addDays(today, 2);
const d3 = addDays(today, 3);
const d4 = addDays(today, 4);
const d5 = addDays(today, 5);
const d6 = addDays(today, 6);

export const CLASS_SCHEDULE: ClassSlot[] = [
  // Today
  { id: 'cls-01', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'footvolley', professorName: 'Rafael Souza', date: d0, startTime: '07:00', endTime: '08:00', maxSpots: 12, bookedSpots: 8, level: 'intermediate' },
  { id: 'cls-02', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'footvolley', professorName: 'Victor Nunes', date: d0, startTime: '09:00', endTime: '10:00', maxSpots: 10, bookedSpots: 10, level: 'advanced' },
  { id: 'cls-03', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'volleyball', professorName: 'Sandrey Lima', date: d0, startTime: '10:00', endTime: '11:30', maxSpots: 14, bookedSpots: 5, level: 'beginner' },
  { id: 'cls-04', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'footvolley', professorName: 'Lucas Prado', date: d0, startTime: '08:00', endTime: '09:00', maxSpots: 8, bookedSpots: 3, level: 'beginner' },
  { id: 'cls-05', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'beach-soccer', professorName: 'João Pedro', date: d0, startTime: '16:00', endTime: '17:00', maxSpots: 16, bookedSpots: 9, level: 'intermediate' },
  { id: 'cls-06', complexId: 'p4', complexName: 'Jurerê Beach Club', sport: 'beach-tennis', professorName: 'Carol Tavares', date: d0, startTime: '08:00', endTime: '09:00', maxSpots: 6, bookedSpots: 4, level: 'high-intermediate' },
  { id: 'cls-07', complexId: 'p4', complexName: 'Jurerê Beach Club', sport: 'beach-tennis', professorName: 'Marina Costa', date: d0, startTime: '10:00', endTime: '11:00', maxSpots: 6, bookedSpots: 6, level: 'high-advanced' },
  { id: 'cls-08', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'footvolley', professorName: 'Rafael Souza', date: d0, startTime: '17:00', endTime: '18:00', maxSpots: 12, bookedSpots: 7, level: 'intermediate' },
  { id: 'cls-09', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'beach-soccer', professorName: 'João Pedro', date: d0, startTime: '18:00', endTime: '19:00', maxSpots: 16, bookedSpots: 2, level: 'beginner' },
  { id: 'cls-10', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'volleyball', professorName: 'Sandrey Lima', date: d0, startTime: '19:00', endTime: '20:30', maxSpots: 14, bookedSpots: 11, level: 'advanced' },
  // Day 1
  { id: 'cls-11', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'footvolley', professorName: 'Victor Nunes', date: d1, startTime: '07:00', endTime: '08:00', maxSpots: 12, bookedSpots: 6, level: 'intermediate' },
  { id: 'cls-12', complexId: 'p4', complexName: 'Jurerê Beach Club', sport: 'beach-tennis', professorName: 'Carol Tavares', date: d1, startTime: '09:00', endTime: '10:00', maxSpots: 6, bookedSpots: 2, level: 'high-intermediate' },
  { id: 'cls-13', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'beach-soccer', professorName: 'João Pedro', date: d1, startTime: '10:00', endTime: '11:00', maxSpots: 16, bookedSpots: 7, level: 'intermediate' },
  { id: 'cls-14', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'volleyball', professorName: 'Sandrey Lima', date: d1, startTime: '17:00', endTime: '18:30', maxSpots: 14, bookedSpots: 9, level: 'beginner' },
  { id: 'cls-15', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'footvolley', professorName: 'Lucas Prado', date: d1, startTime: '18:00', endTime: '19:00', maxSpots: 10, bookedSpots: 4, level: 'beginner' },
  // Day 2
  { id: 'cls-16', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'footvolley', professorName: 'Rafael Souza', date: d2, startTime: '07:00', endTime: '08:00', maxSpots: 12, bookedSpots: 10, level: 'advanced' },
  { id: 'cls-17', complexId: 'p4', complexName: 'Jurerê Beach Club', sport: 'beach-tennis', professorName: 'Marina Costa', date: d2, startTime: '09:00', endTime: '10:00', maxSpots: 6, bookedSpots: 3, level: 'high-advanced' },
  { id: 'cls-18', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'volleyball', professorName: 'Sandrey Lima', date: d2, startTime: '10:00', endTime: '11:30', maxSpots: 14, bookedSpots: 0, level: 'beginner' },
  { id: 'cls-19', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'beach-soccer', professorName: 'João Pedro', date: d2, startTime: '16:00', endTime: '17:00', maxSpots: 16, bookedSpots: 12, level: 'intermediate' },
  { id: 'cls-20', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'footvolley', professorName: 'Victor Nunes', date: d2, startTime: '19:00', endTime: '20:00', maxSpots: 10, bookedSpots: 5, level: 'intermediate' },
  // Day 3
  { id: 'cls-21', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'footvolley', professorName: 'Lucas Prado', date: d3, startTime: '08:00', endTime: '09:00', maxSpots: 8, bookedSpots: 1, level: 'beginner' },
  { id: 'cls-22', complexId: 'p4', complexName: 'Jurerê Beach Club', sport: 'beach-tennis', professorName: 'Carol Tavares', date: d3, startTime: '09:00', endTime: '10:00', maxSpots: 6, bookedSpots: 5, level: 'high-intermediate' },
  { id: 'cls-23', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'volleyball', professorName: 'Sandrey Lima', date: d3, startTime: '17:00', endTime: '18:30', maxSpots: 14, bookedSpots: 8, level: 'intermediate' },
  { id: 'cls-24', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'beach-soccer', professorName: 'João Pedro', date: d3, startTime: '18:00', endTime: '19:00', maxSpots: 16, bookedSpots: 16, level: 'advanced' },
  // Day 4
  { id: 'cls-25', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'footvolley', professorName: 'Rafael Souza', date: d4, startTime: '07:00', endTime: '08:00', maxSpots: 12, bookedSpots: 4, level: 'intermediate' },
  { id: 'cls-26', complexId: 'p4', complexName: 'Jurerê Beach Club', sport: 'beach-tennis', professorName: 'Marina Costa', date: d4, startTime: '10:00', endTime: '11:00', maxSpots: 6, bookedSpots: 1, level: 'high-advanced' },
  { id: 'cls-27', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'beach-soccer', professorName: 'João Pedro', date: d4, startTime: '16:00', endTime: '17:00', maxSpots: 16, bookedSpots: 6, level: 'beginner' },
  { id: 'cls-28', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'volleyball', professorName: 'Sandrey Lima', date: d4, startTime: '19:00', endTime: '20:30', maxSpots: 14, bookedSpots: 13, level: 'advanced' },
  // Day 5
  { id: 'cls-29', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'footvolley', professorName: 'Victor Nunes', date: d5, startTime: '09:00', endTime: '10:00', maxSpots: 10, bookedSpots: 7, level: 'advanced' },
  { id: 'cls-30', complexId: 'p4', complexName: 'Jurerê Beach Club', sport: 'beach-tennis', professorName: 'Carol Tavares', date: d5, startTime: '08:00', endTime: '09:00', maxSpots: 6, bookedSpots: 3, level: 'high-intermediate' },
  { id: 'cls-31', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'footvolley', professorName: 'Lucas Prado', date: d5, startTime: '10:00', endTime: '11:00', maxSpots: 8, bookedSpots: 8, level: 'intermediate' },
  { id: 'cls-32', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'volleyball', professorName: 'Sandrey Lima', date: d5, startTime: '17:00', endTime: '18:30', maxSpots: 14, bookedSpots: 2, level: 'beginner' },
  // Day 6
  { id: 'cls-33', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'footvolley', professorName: 'Rafael Souza', date: d6, startTime: '09:00', endTime: '10:00', maxSpots: 12, bookedSpots: 5, level: 'intermediate' },
  { id: 'cls-34', complexId: 'p4', complexName: 'Jurerê Beach Club', sport: 'beach-tennis', professorName: 'Marina Costa', date: d6, startTime: '10:00', endTime: '11:00', maxSpots: 6, bookedSpots: 4, level: 'high-advanced' },
  { id: 'cls-35', complexId: 'p3', complexName: 'Contorno da Bola', sport: 'beach-soccer', professorName: 'João Pedro', date: d6, startTime: '11:00', endTime: '12:00', maxSpots: 16, bookedSpots: 10, level: 'beginner' },
  { id: 'cls-36', complexId: 'p2', complexName: 'FTM Sports Center', sport: 'volleyball', professorName: 'Sandrey Lima', date: d6, startTime: '19:00', endTime: '20:30', maxSpots: 14, bookedSpots: 14, level: 'advanced' },
];
