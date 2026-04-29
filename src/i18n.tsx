import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SportId, User } from '@/types';

export type Language = 'en' | 'pt-BR';

type MessageCatalog = {
  [key: string]: string | Record<string, string>;
};

const messages: Record<Language, MessageCatalog> = {
  en: {
    searchPlaceholder: 'Search championships, players, courts...',
    languageSelectorAria: 'Select language',
    menu: 'Menu',
    sports: 'Sports',
    dashboard: 'Dashboard',
    championships: 'Championships',
    reservations: 'Reservations',
    mySchedule: 'My Schedule',
    settings: 'Settings',
    logout: 'Logout',
    welcomeBack: 'Welcome back',
    hey: 'Hey',
    tournamentsTailored: 'Tournaments tailored to your favorite sports.',
    liveNow: 'Live Now',
    upcoming: 'Upcoming',
    mySports: 'My Sports',
    featuredTournaments: 'Featured tournaments',
    upcomingForYou: 'Upcoming For You',
    nextStops: 'Next stops',
    discoverOtherSports: 'Discover Other Sports',
    expandArena: 'Expand your arena',
    allCompetitions: 'All competitions',
    bookACourt: 'Book a court',
    findArenasAndReserve: 'Find arenas and reserve your slot.',
    reserve: 'Reserve',
    courts: 'courts',
    noReservations: 'No reservations.',
    scheduleTitle: 'My Schedule',
    scheduleDescription: 'Your upcoming matches and reservations will appear here.',
    scheduleEmpty: 'Nothing scheduled yet. Reserve a court or join a tournament.',
    sport: 'Sport',
    sportNotFound: 'Sport not found.',
    noChampionshipsYet: 'No championships yet. Check back soon.',
    whereToPlay: 'Where To Play',
    distributor: 'Distributor',
    courtManagement: 'Court Management',
    available: 'Available',
    occupied: 'Occupied',
    reservationsLabel: 'Reservations',
    championshipNotFound: 'Championship not found.',
    back: 'Back',
    bracket: 'Bracket',
    bracketSize: 'Bracket Size',
    category: 'Category',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    professional: 'Professional',
    winnerBracket: 'Winner Bracket',
    loserBracket: 'Repechage',
    finalsBracket: 'Finals',
    winners: 'Winners',
    oneLoss: 'One Loss',
    oneLossHint: 'Teams with one loss still have a path back to the final.',
    populateLater: 'This section will be populated from the upper bracket after the games are completed.',
    prizePool: 'Prize Pool',
    viewBracket: 'View bracket',
    teams: 'teams',
    champion: 'Champion',
    final: 'Final',
    live: 'Live',
    tbd: 'TBD',
    pageNotFound: 'Oops! Page not found',
    returnHome: 'Return to Home',
    enterArena: 'Enter the arena. Manage your game.',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    or: 'or',
    continueWithGoogle: 'Continue with Google',
    newHere: 'New here?',
    createAccount: 'Create an account',
    sportsManagement: 'Joga Junto 360 · Sports Management',
    userTypes: {
      player: 'Player',
      distributor: 'Distributor',
    },
    sportsById: {
      footvolley: 'Footvolley',
      'beach-tennis': 'Beach Tennis',
      'beach-soccer': 'Beach Soccer',
      volleyball: 'Volleyball',
      padel: 'Padel',
    },
    rounds: {
      'Round of 16': 'Round of 16',
      'Round of 32': 'Round of 32',
      Quartas: 'Quarter-finals',
      Semi: 'Semi',
      'Quarter-finals': 'Quarter-finals',
      'Quarter-final': 'Quarter-final',
      'Semi-finals': 'Semi-finals',
      'Semi-final': 'Semi-final',
      '3rd Place': '3rd Place',
      'Disputa de 3º Lugar': '3rd Place',
      Final: 'Final',
      Opening: 'Opening',
      'Group Stage': 'Group Stage',
    },
  },
  'pt-BR': {
    searchPlaceholder: 'Buscar campeonatos, jogadores, quadras...',
    languageSelectorAria: 'Selecionar idioma',
    menu: 'Menu',
    sports: 'Esportes',
    dashboard: 'Dashboard',
    championships: 'Campeonatos',
    reservations: 'Reservas',
    mySchedule: 'Minha Agenda',
    settings: 'Configurações',
    logout: 'Sair',
    welcomeBack: 'Bem-vindo de volta',
    hey: 'Olá',
    tournamentsTailored: 'Campeonatos pensados para os seus esportes favoritos.',
    liveNow: 'Ao Vivo',
    upcoming: 'Próximos',
    mySports: 'Meus Esportes',
    featuredTournaments: 'Campeonatos em destaque',
    upcomingForYou: 'Próximos para você',
    nextStops: 'Próximas paradas',
    discoverOtherSports: 'Descubra Outros Esportes',
    expandArena: 'Expanda sua arena',
    allCompetitions: 'Todos os campeonatos',
    bookACourt: 'Reserve uma quadra',
    findArenasAndReserve: 'Encontre arenas e reserve seu horário.',
    reserve: 'Reservar',
    courts: 'quadras',
    noReservations: 'Sem reservas.',
    scheduleTitle: 'Minha Agenda',
    scheduleDescription: 'Suas próximas partidas e reservas aparecerão aqui.',
    scheduleEmpty: 'Nada agendado ainda. Reserve uma quadra ou entre em um torneio.',
    sport: 'Esporte',
    sportNotFound: 'Esporte não encontrado.',
    noChampionshipsYet: 'Ainda não há campeonatos. Volte em breve.',
    whereToPlay: 'Onde Jogar',
    distributor: 'Distribuidor',
    courtManagement: 'Gestão de Quadras',
    available: 'Disponível',
    occupied: 'Ocupada',
    reservationsLabel: 'Reservas',
    championshipNotFound: 'Campeonato não encontrado.',
    back: 'Voltar',
    bracket: 'Chave',
    bracketSize: 'Tamanho da Chave',
    category: 'Categoria',
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    professional: 'Profissional',
    winnerBracket: 'Chave dos Vencedores',
    loserBracket: 'Repescagem',
    finalsBracket: 'Finais',
    winners: 'Winners',
    oneLoss: 'Uma Derrota',
    oneLossHint: 'Equipes com uma derrota ainda mantêm um caminho de volta para a final.',
    populateLater: 'Esta seção será preenchida a partir da chave superior depois que os jogos forem concluídos.',
    prizePool: 'Premiação',
    viewBracket: 'Ver chave',
    teams: 'times',
    champion: 'Campeão',
    final: 'Final',
    live: 'Ao Vivo',
    tbd: 'A definir',
    pageNotFound: 'Ops! Página não encontrada',
    returnHome: 'Voltar para o início',
    enterArena: 'Entre na arena. Gerencie o seu jogo.',
    email: 'E-mail',
    password: 'Senha',
    signIn: 'Entrar',
    or: 'ou',
    continueWithGoogle: 'Continuar com Google',
    newHere: 'Novo por aqui?',
    createAccount: 'Criar conta',
    sportsManagement: 'Joga Junto 360 · Gestão Esportiva',
    userTypes: {
      player: 'Jogador',
      distributor: 'Distribuidor',
    },
    sportsById: {
      footvolley: 'Futevôlei',
      'beach-tennis': 'Beach Tennis',
      'beach-soccer': 'Futebol de Areia',
      volleyball: 'Vôlei',
      padel: 'Padel',
    },
    rounds: {
      'Round of 16': 'Oitavas de final',
      'Round of 32': 'Fase de 32',
      Quartas: 'Quartas',
      Semi: 'Semi',
      'Quarter-finals': 'Quartas de final',
      'Quarter-final': 'Quartas de final',
      'Semi-finals': 'Semifinais',
      'Semi-final': 'Semifinal',
      '3rd Place': 'Disputa de 3º Lugar',
      'Disputa de 3º Lugar': 'Disputa de 3º Lugar',
      Final: 'Final',
      Opening: 'Abertura',
      'Group Stage': 'Fase de grupos',
    },
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  sportName: (sportId: SportId) => string;
  roundName: (round: string) => string;
  userTypeLabel: (type: User['type']) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const storageKey = 'joga-junto-language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = window.localStorage.getItem(storageKey);
    return stored === 'pt-BR' || stored === 'en' ? stored : 'en';
  });

  const value = useMemo<LanguageContextValue>(() => {
    const dictionary = messages[language];

    const lookupMap = (key: string, mapKey: string) => {
      const map = dictionary[key] as Record<string, string> | undefined;
      return map?.[mapKey] ?? mapKey;
    };

    return {
      language,
      setLanguage: (nextLanguage) => {
        window.localStorage.setItem(storageKey, nextLanguage);
        setLanguage(nextLanguage);
      },
      t: (key) => {
        const value = dictionary[key];
        return typeof value === 'string' ? value : key;
      },
      sportName: (sportId) => lookupMap('sportsById', sportId),
      roundName: (round) => lookupMap('rounds', round),
      userTypeLabel: (type) => lookupMap('userTypes', type),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
