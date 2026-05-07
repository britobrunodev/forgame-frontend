export type SportId =
  | "footvolley"
  | "beach-tennis"
  | "beach-soccer"
  | "volleyball";
export type UserProfile = "player" | "gestor";
export type GestorRole = "owner" | "manager" | "professor" | "scorer";
export type UserRole = "player" | "owner" | "manager" | "professor" | "scorer";
export type PlayerCharacteristic =
  | "right"
  | "left"
  | "goalkeeper"
  | "midfielder";
export type PlayerLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "silver"
  | "gold"
  | "professional";
export type PaymentMethod =
  | "pix"
  | "credit-card"
  | "debit-card"
  | "pay-on-site";
export type PaymentSourceType =
  | "championship"
  | "court"
  | "wellhub"
  | "totalpass";
export type PaymentTransactionStatus = "paid" | "pending" | "failed";

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
  status: "scheduled" | "live" | "finished";
  time?: string;
}

export type ChampionshipFormat = "double" | "cumbuca" | "rei-da-praia";

export interface ChampionshipCategory {
  id: string;
  name: string;
  format: ChampionshipFormat;
  entryFee: number;
}

export interface Championship {
  id: string;
  name: string;
  sport: SportId;
  location: string;
  startDate: string;
  endDate: string;
  teamsCount: number;
  status: "upcoming" | "live" | "finished";
  banner?: string;
  image?: string;
  prize?: string;
  youtubeUrl?: string;
  rounds: { name: string; matches: Match[] }[];
  format?: ChampionshipFormat;
  entryFee?: number;
  complexId?: string;
  categories?: ChampionshipCategory[];
}

export interface PaymentTransaction {
  id: string;
  reference: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  status: PaymentTransactionStatus;
}

export interface ManagedChampionshipPayment {
  userId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "paid" | "pending";
  transactions: PaymentTransaction[];
}

export interface ManagedChampionship {
  id: string;
  complexId: string;
  name: string;
  sport: SportId;
  startDate: string;
  endDate: string;
  teamsCount: number;
  status: "upcoming" | "live" | "finished";
  image?: string;
  payments: ManagedChampionshipPayment[];
}

export interface ManagedCourtPayment {
  id: string;
  complexId: string;
  courtId: string;
  courtName: string;
  reservationDate: string;
  timeSlot: string;
  userId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "paid" | "pending";
  transactions: PaymentTransaction[];
}

export interface ManagedThirdPartyPayment {
  id: string;
  complexId: string;
  sourceType: "wellhub" | "totalpass";
  userName: string;
  userEmail: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "paid" | "pending";
  transactions: PaymentTransaction[];
}

export interface ClassSlot {
  id: string;
  complexId: string;
  complexName: string;
  sport: SportId;
  professorName: string;
  date: string;
  startTime: string;
  endTime: string;
  maxSpots: number;
  bookedSpots: number;
  level?: PlayerLevel;
  enrolledPlayerIds?: string[] | null;
}

export interface Court {
  id: string;
  name: string;
  complexId: string;
  dimensions: string;
  application: string; // e.g. Arena Beach Copacabana
  hourlyRate: number;
  monthlyRate: number;
  slotOptions: { start: string; end: string }[];
  reservations: {
    date: string;
    start: string;
    end: string;
    user: string;
    type?: "single" | "monthly";
  }[];
}

export interface ReservationPlace {
  id: string | number;
  name: string;
  city: string;
  sports: SportId[];
  courts: number;
  rating: number;
  image?: string;
  country?: string;
  zipCode?: string;
  street?: string;
  addressNumber?: string;
  addressComplement?: string;
  imageOffsetY?: number;
  active?: boolean;
}

export type DocumentType = "cpf" | "rg" | "cc" | "passport";
export type UniformSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface User {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  isAdmin?: boolean;
  type: "player" | "gestor";
  roles?: UserRole[];
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
  documentType?: DocumentType;
  documentNumber?: string;
  uniformSize?: UniformSize;
  preferredClassPaymentMethod?: PaymentMethod;
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
  startDate: string;
  endDate: string;
  courtIds: string[];
  price: number;
}

export interface ComplexPreference {
  complexId: string;
  weekSchedule: DaySchedule[];
  holidays: HolidaySchedule[];
  paymentMethods: PaymentMethod[];
  classesPaymentMethods: PaymentMethod[];
  rentalPaymentMethods: PaymentMethod[];
  championshipPaymentMethods: PaymentMethod[];
  pricingRules: PricingRule[];
}
