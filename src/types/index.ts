export type SportId = 'footvolley' | 'beach-tennis' | 'beach-soccer' | 'volleyball';
export type UserProfile = 'player' | 'gestor';
export type GestorRole = 'owner' | 'manager' | 'professor';
export type PlayerCharacteristic = 'right' | 'left' | 'goalkeeper' | 'midfielder';
export type PlayerLevel = 'beginner' | 'intermediate' | 'advanced' | 'silver' | 'gold' | 'professional';
export type PaymentMethod = 'pix' | 'credit-card' | 'debit-card' | 'pay-on-site';

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
  setScoreA?: number;
  setScoreB?: number;
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
  youtubeUrl?: string;
  rounds: { name: string; matches: Match[] }[];
}

export interface Court {
  id: string;
  name: string;
  complexId: string;
  dimensions: string;
  application: string; // e.g. Arena Beach Copacabana
  hourlyRate: number;
  monthlyRate: number;
  reservations: { date: string; start: string; end: string; user: string; type?: 'single' | 'monthly' }[];
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
  type: 'player' | 'gestor';
  profiles?: UserProfile[];
  gestorRoles?: GestorRole[];
  preferences: SportId[];
  applications?: string[];
  avatarUrl?: string;
  country?: string;
  phoneCountry?: string;
  phoneNumber?: string;
  sportCharacteristics?: Partial<Record<SportId, PlayerCharacteristic[]>>;
  level?: PlayerLevel;
  wins?: number;
  losses?: number;
  draws?: number;
  ownedComplexIds?: string[];
}

export interface ManagedPlayer {
  id: string;
  name: string;
  email: string;
  complexId: string;
  sports: SportId[];
  level: PlayerLevel;
  score: number;
  avatarUrl?: string;
}

export interface DaySchedule {
  day: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

export interface HolidaySchedule {
  date: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

export interface PricingRule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface ComplexPreference {
  complexId: string;
  weekSchedule: DaySchedule[];
  holidays: HolidaySchedule[];
  paymentMethods: PaymentMethod[];
  pricingRules: PricingRule[];
}
