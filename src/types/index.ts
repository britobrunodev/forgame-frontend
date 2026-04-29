export type SportId = 'footvolley' | 'beach-tennis' | 'beach-soccer' | 'volleyball' | 'padel';

export interface Sport {
  id: SportId;
  name: string;
  icon: string;
}

export interface Team {
  id: string;
  name: string;
  seed?: number;
}

export interface Match {
  id: string;
  round: string;
  teamA: Team | null;
  teamB: Team | null;
  scoreA?: number;
  scoreB?: number;
  status: 'scheduled' | 'live' | 'finished';
  time?: string;
}

export interface Championship {
  id: string;
  name: string;
  sport: SportId;
  location: string;
  startDate: string;
  endDate: string;
  teamsCount: number;
  status: 'upcoming' | 'live' | 'finished';
  banner?: string;
  image?: string;
  prize?: string;
  rounds: { name: string; matches: Match[] }[];
}

export interface Court {
  id: string;
  name: string;
  sport: SportId;
  application: string; // e.g. FTM, Contorno da Bola
  reservations: { date: string; start: string; end: string; user: string }[];
}

export interface ReservationPlace {
  id: string;
  name: string;
  city: string;
  sports: SportId[];
  courts: number;
  rating: number;
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'player' | 'distributor';
  preferences: SportId[];
  applications?: string[];
}
