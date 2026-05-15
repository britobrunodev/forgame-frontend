const API_BASE = import.meta.env.API_URL ?? "/api/v1";

let _onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (fn: () => void) => {
  _onUnauthorized = fn;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  picture_url: string | null;
  roles: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  pending_approval: boolean;
  user: AuthUser;
}

export interface ApprovalRequest {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  requested_role: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by_name: string | null;
}

export interface ManagedComplex {
  id: number;
  name: string;
  city: string | null;
  address: string | null;
}

export interface ManagedChampionship {
  id: number;
  name: string;
  sport_name: string | null;
  complex_name: string | null;
  owner_id: number | null;
  owner_name: string | null;
  owner_email: string | null;
}

export interface AccessControlUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface ComplexRoleAssignment {
  complex_id: number;
  user_id: number;
  role: string;
}

export interface ChampionshipRoleAssignment {
  championship_id: number;
  user_id: number;
  role: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface AccessControlSnapshot {
  complexes: ManagedComplex[];
  users: AccessControlUser[];
  assignments: ComplexRoleAssignment[];
  assignable_roles: string[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ChampionshipAccessControlSnapshot {
  championships: ManagedChampionship[];
  users: AccessControlUser[];
  assignments: ChampionshipRoleAssignment[];
  assignable_roles: string[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

const json = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      _onUnauthorized?.();
    }
    if (res.status === 413) {
      throw new ApiError('Image too large', 413);
    }
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError((body as { detail?: string }).detail ?? res.statusText, res.status);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}

export interface PlayerProfile {
  name: string;
  nickname: string | null;
  email: string;
  picture_url: string | null;
  google_picture_url: string | null;
  document_type: string | null;
  document_number: string | null;
  phone_country: string | null;
  phone_number: string | null;
  country: string | null;
  uniform_size: string | null;
  gender: string | null;
  level: string | null;
  preferred_sports: string[] | null;
  preferred_complexes: number[] | null;
  wins: number;
  losses: number;
  draws: number;
  sport_characteristics: Record<string, string[]> | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
}

export interface PlayerProfileUpdateInput {
  name: string;
  email?: string | null;
  nickname?: string | null;
  document_type: string | null;
  document_number: string | null;
  phone_country: string | null;
  phone_number: string | null;
  country: string | null;
  uniform_size: string | null;
  gender: string | null;
  level: string | null;
  preferred_sports: string[] | null;
  preferred_complexes: number[] | null;
  sport_characteristics: Record<string, string[]> | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
}

export interface CategoryData {
  id: number;
  slug: string;
  name: string;
  sort_order: number;
}

export interface PlayerListItem {
  id: number;
  name: string;
  nickname: string | null;
  email: string;
  picture_url: string | null;
  level: string | null;
  gender: string | null;
}

export interface ChampionshipSubscriptionData {
  payment_id: number | null;
  payment_status: string | null;
  total_amount: number | null;
  subscription_status: string;
  team_id: number;
  subscription_ids: number[];
}

export interface ChampionshipSubscriptionListItem {
  id: number;
  championship_id: number;
  championship_name: string;
  complex_id: number | null;
  complex_name: string | null;
  category_id: number;
  category_slug: string;
  audience_slug: string;
  format_slug: string;
  team_id: number;
  team_user_ids: number[];
  status: string;
  amount: number | null;
  payment_id: number | null;
  payment_status: string | null;
  payment_total_amount: number | null;
  payment_remaining_amount: number | null;
  start_at: string | null;
  created_at: string;
}

export interface PaymentTransactionData {
  id: number;
  reference: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

export interface PaymentData {
  id: number;
  user_name: string;
  user_email: string;
  complex_id: number | null;
  source_type: string;
  source_id: number;
  source_name: string;
  source_date: string | null;
  category_start_date: string | null;
  category_start_time: string | null;
  status: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  created_at: string;
  transactions: PaymentTransactionData[];
}

export interface SportComplexData {
  id: number;
  is_active: boolean;
  name: string;
  city: string | null;
  country: string | null;
  neighborhood: string | null;
  zip_code: string | null;
  street: string | null;
  address_number: string | null;
  address_complement: string | null;
  image_url: string | null;
  image_offset_x: number;
  image_offset_y: number;
  image_zoom: number;
  available_sports: string[];
}

export interface CreateSportComplexInput {
  name: string;
  city?: string | null;
  country?: string | null;
  neighborhood?: string | null;
  zip_code?: string | null;
  street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  image_offset_x?: number;
  image_offset_y?: number;
  image_zoom?: number;
  available_sports?: string[];
}

export const sportComplexApi = {
  listAll: (token: string, page = 1, perPage = 12) =>
    fetch(`${API_BASE}/complexes/all?page=${page}&per_page=${perPage}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<SportComplexData>>(r)),

  list: (token: string, page = 1, perPage = 12) =>
    fetch(`${API_BASE}/complexes?page=${page}&per_page=${perPage}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<SportComplexData>>(r)),

  get: (token: string, complexId: number | string) =>
    fetch(`${API_BASE}/complexes/${complexId}`, {
      headers: json(token),
    }).then((r) => handle<SportComplexData>(r)),

  create: (token: string, body: CreateSportComplexInput) =>
    fetch(`${API_BASE}/complexes`, {
      method: "POST",
      headers: json(token),
      body: JSON.stringify(body),
    }).then((r) => handle<SportComplexData>(r)),

  update: (
    token: string,
    complexId: number | string,
    body: CreateSportComplexInput,
  ) =>
    fetch(`${API_BASE}/complexes/${complexId}`, {
      method: "PUT",
      headers: json(token),
      body: JSON.stringify(body),
    }).then((r) => handle<SportComplexData>(r)),

  search: (token: string, q = '', limit = 20) =>
    fetch(`${API_BASE}/complexes/search?q=${encodeURIComponent(q)}&limit=${limit}`, {
      headers: json(token),
    }).then((r) => handle<Array<{ id: number; name: string; city: string | null }>>(r)),

  listMine: (token: string) =>
    fetch(`${API_BASE}/complexes/mine`, { headers: json(token) }).then(
      (r) => handle<Array<{ id: number; name: string; city: string | null }>>(r),
    ),

  delete: (token: string, complexId: number | string) =>
    fetch(`${API_BASE}/complexes/${complexId}`, {
      method: 'DELETE',
      headers: json(token),
    }).then((r) => handle<void>(r)),

  uploadImage: async (
    token: string,
    complexId: number | string,
    dataUrl: string,
  ): Promise<{ url: string }> => {
    const [, base64] = dataUrl.split(",");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "image/jpeg" });
    const form = new FormData();
    form.append("file", blob, "complex.jpg");
    const res = await fetch(`${API_BASE}/complexes/${complexId}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    return handle<{ url: string }>(res);
  },
};

export const usersApi = {
  uploadAvatar: async (
    token: string,
    dataUrl: string,
  ): Promise<{ url: string }> => {
    const [, base64] = dataUrl.split(",");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "image/jpeg" });
    const form = new FormData();
    form.append("file", blob, "avatar.jpg");
    const res = await fetch(`${API_BASE}/users/me/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    return handle<{ url: string }>(res);
  },

  getProfile: (token: string) =>
    fetch(`${API_BASE}/users/me/profile`, { headers: json(token) }).then((r) =>
      handle<PlayerProfile>(r),
    ),

  updateProfile: (token: string, profile: PlayerProfileUpdateInput) =>
    fetch(`${API_BASE}/users/me/profile`, {
      method: "PUT",
      headers: json(token),
      body: JSON.stringify(profile),
    }).then((r) => handle<PlayerProfile>(r)),

  listPlayers: (token: string, page = 1, perPage = 20, search = '', gender = '') =>
    fetch(`${API_BASE}/users/players?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}${gender ? `&gender=${encodeURIComponent(gender)}` : ''}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<PlayerListItem>>(r)),

  updateTheme: (token: string, theme: 'light' | 'dark' | 'system') =>
    fetch(`${API_BASE}/users/me/theme`, {
      method: 'PATCH',
      headers: json(token),
      body: JSON.stringify({ theme }),
    }).then((r) => handle<{ theme: string }>(r)),
};

export const categoriesApi = {
  list: (token: string) =>
    fetch(`${API_BASE}/categories`, {
      headers: json(token),
    }).then((r) => handle<CategoryData[]>(r)),
};

export interface ChampionshipFormatData {
  id: number;
  sport_id: number;
  name: string;
  slug: string;
  config_json: Record<string, unknown> | null;
}

export const championshipFormatsApi = {
  list: (token: string, sportId?: number) => {
    const url = sportId
      ? `${API_BASE}/championship-formats?sport_id=${sportId}`
      : `${API_BASE}/championship-formats`;
    return fetch(url, { headers: json(token) }).then((r) => handle<ChampionshipFormatData[]>(r));
  },
};

export interface SportData {
  id: number;
  slug: string;
  name: string;
}

export const sportsApi = {
  list: (token: string) =>
    fetch(`${API_BASE}/sports`, { headers: json(token) }).then((r) =>
      handle<SportData[]>(r),
    ),
};

export interface CourtSlotOption {
  start: string;
  end: string;
}

export interface CourtData {
  id: number;
  complex_id: number;
  name: string;
  dimensions: string;
  application: string;
  hourly_rate: number;
  monthly_rate: number;
  slot_options: CourtSlotOption[];
  is_active: boolean;
}

export interface CourtInput {
  name: string;
  dimensions?: string;
  application?: string;
  hourly_rate?: number;
  monthly_rate?: number;
  slot_options?: CourtSlotOption[];
  is_active?: boolean;
}

export const courtsApi = {
  list: (token: string, complexId: number | string) =>
    fetch(`${API_BASE}/complexes/${complexId}/courts`, { headers: json(token) }).then((r) =>
      handle<CourtData[]>(r),
    ),

  listAll: (token: string, complexId: number | string) =>
    fetch(`${API_BASE}/complexes/${complexId}/courts/all`, { headers: json(token) }).then((r) =>
      handle<CourtData[]>(r),
    ),

  get: (token: string, complexId: number | string, courtId: number | string) =>
    fetch(`${API_BASE}/complexes/${complexId}/courts/${courtId}`, { headers: json(token) }).then((r) =>
      handle<CourtData>(r),
    ),

  create: (token: string, complexId: number | string, body: CourtInput) =>
    fetch(`${API_BASE}/complexes/${complexId}/courts`, {
      method: "POST",
      headers: json(token),
      body: JSON.stringify(body),
    }).then((r) => handle<CourtData>(r)),

  update: (token: string, complexId: number | string, courtId: number | string, body: CourtInput) =>
    fetch(`${API_BASE}/complexes/${complexId}/courts/${courtId}`, {
      method: "PUT",
      headers: json(token),
      body: JSON.stringify(body),
    }).then((r) => handle<CourtData>(r)),

  delete: (token: string, complexId: number | string, courtId: number | string) =>
    fetch(`${API_BASE}/complexes/${complexId}/courts/${courtId}`, {
      method: "DELETE",
      headers: json(token),
    }).then((r) => handle<void>(r)),
};

export const accessControlApi = {
  getSnapshot: (
    token: string,
    page = 1,
    perPage = 12,
    search = '',
  ) =>
    fetch(
      `${API_BASE}/access-control?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`,
      { headers: json(token) },
    ).then((r) =>
      handle<AccessControlSnapshot>(r),
    ),

  updateAssignments: (
    token: string,
    payload: {
      complex_id: number;
      assignments: Array<{ user_id: number; role: string }>;
    },
  ) =>
    fetch(`${API_BASE}/access-control`, {
      method: "PUT",
      headers: json(token),
      body: JSON.stringify(payload),
    }).then((r) => handle<ComplexRoleAssignment[]>(r)),
};

export const championshipAccessControlApi = {
  getSnapshot: (
    token: string,
    page = 1,
    perPage = 12,
    search = '',
  ) =>
    fetch(
      `${API_BASE}/championship-access-control?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`,
      { headers: json(token) },
    ).then((r) =>
      handle<ChampionshipAccessControlSnapshot>(r),
    ),

  updateAssignments: (
    token: string,
    payload: {
      championship_id: number;
      assignments: Array<{ user_id: number; role: string }>;
    },
  ) =>
    fetch(`${API_BASE}/championship-access-control`, {
      method: "PUT",
      headers: json(token),
      body: JSON.stringify(payload),
    }).then((r) => handle<ChampionshipRoleAssignment[]>(r)),
};

export const authApi = {
  getMe: (token: string) =>
    fetch(`${API_BASE}/auth/me`, { headers: json(token) }).then((r) =>
      handle<AuthUser>(r),
    ),

  sendVerification: (email: string) =>
    fetch(`${API_BASE}/auth/send-verification`, {
      method: "POST",
      headers: json(),
      body: JSON.stringify({ email }),
    }).then((r) => handle<void>(r)),

  verifyCode: (email: string, code: string) =>
    fetch(`${API_BASE}/auth/verify-code`, {
      method: "POST",
      headers: json(),
      body: JSON.stringify({ email, code }),
    }).then((r) => handle<{ verified: boolean }>(r)),

  register: (
    name: string,
    email: string,
    password: string,
    requested_profile: "player" | "gestor",
  ) =>
    fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: json(),
      body: JSON.stringify({ name, email, password, requested_profile }),
    }).then((r) => handle<AuthResponse>(r)),

  emailLogin: (email: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: json(),
      body: JSON.stringify({ email, password }),
    }).then((r) => handle<AuthResponse>(r)),

  googleLogin: (access_token: string, requested_profile: "player" | "gestor") =>
    fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: json(),
      body: JSON.stringify({ access_token, requested_profile }),
    }).then((r) => handle<AuthResponse>(r)),

  getApprovals: (token: string, page = 1, perPage = 12) =>
    fetch(`${API_BASE}/auth/approvals?page=${page}&per_page=${perPage}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<ApprovalRequest>>(r)),

  getAllApprovals: (token: string, page = 1, perPage = 12) =>
    fetch(
      `${API_BASE}/auth/approvals/history?page=${page}&per_page=${perPage}`,
      { headers: json(token) },
    ).then((r) => handle<PaginatedResponse<ApprovalRequest>>(r)),

  approveRequest: (token: string, requestId: number | string) =>
    fetch(`${API_BASE}/auth/approvals/${requestId}/approve`, {
      method: "POST",
      headers: json(token),
    }).then((r) => handle<{ message: string }>(r)),

  rejectRequest: (token: string, requestId: number | string) =>
    fetch(`${API_BASE}/auth/approvals/${requestId}/reject`, {
      method: "POST",
      headers: json(token),
    }).then((r) => handle<{ message: string }>(r)),

  revokeApproval: (token: string, requestId: number | string) =>
    fetch(`${API_BASE}/auth/approvals/${requestId}/revoke`, {
      method: "POST",
      headers: json(token),
    }).then((r) => handle<{ message: string }>(r)),
};

// ── Championships ────────────────────────────────────────────────────────────

export interface ChampionshipCategoryData {
  id?: number;
  format_id: number | null;
  format_slug: string;
  category_slug: string;
  audience_slug: string;
  entry_fee: number | null;
  max_subscriptions: number | null;
  subscriptions_count: number;
  is_full: boolean;
  auto_generate_matches: boolean;
  requires_approval: boolean;
  start_date: string | null;
  start_time: string | null;
}

export interface ChampionshipCategoryInput {
  id?: number | null;
  format_id: number | null;
  category_slug: string;
  audience_slug: string;
  entry_fee: number | null;
  max_subscriptions: number | null;
  auto_generate_matches: boolean;
  requires_approval: boolean;
  start_date: string | null;
  start_time: string | null;
}

export interface SportData {
  id: number;
  name: string;
  slug: string;
}

export interface ChampionshipData {
  id: number;
  name: string;
  sport_id: number | null;
  complex_id: number | null;
  complex_name: string | null;
  complex_city: string | null;
  owner_id: number | null;
  start_at: string | null;
  end_at: string | null;
  registration_deadline_at: string | null;
  timezone: string | null;
  status: 'draft' | 'open' | 'subscription_ended' | 'live' | 'ended' | string;
  is_public: boolean;
  transmission_url: string | null;
  address_url: string | null;
  notes: string | null;
  uniform_included: boolean;
  auto_generate_status: boolean;
  image_url: string | null;
  image_offset_x: number;
  image_offset_y: number;
  image_zoom: number;
  config_json: Record<string, unknown> | null;
  categories: ChampionshipCategoryData[];
  created_at: string;
  updated_at: string;
}

export interface ChampionshipInput {
  name: string;
  sport_id?: number | null;
  complex_id?: number | null;
  start_at?: string | null;
  end_at?: string | null;
  registration_deadline_at?: string | null;
  timezone?: string | null;
  status?: string;
  is_public?: boolean;
  transmission_url?: string | null;
  address_url?: string | null;
  notes?: string | null;
  uniform_included?: boolean;
  auto_generate_status?: boolean;
  image_offset_x?: number;
  image_offset_y?: number;
  image_zoom?: number;
  config_json?: Record<string, unknown> | null;
  categories?: ChampionshipCategoryInput[];
}

export const championshipApi = {
  listSports: (token: string) =>
    fetch(`${API_BASE}/championships/sports`, {
      headers: json(token),
    }).then((r) => handle<SportData[]>(r)),

  list: (token: string, page = 1, perPage = 12) =>
    fetch(`${API_BASE}/championships?page=${page}&per_page=${perPage}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<ChampionshipData>>(r)),

  listMine: (token: string, page = 1, perPage = 12) =>
    fetch(`${API_BASE}/championships/mine?page=${page}&per_page=${perPage}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<ChampionshipData>>(r)),

  get: (token: string, id: number | string) =>
    fetch(`${API_BASE}/championships/${id}`, { headers: json(token) }).then(
      (r) => handle<ChampionshipData>(r),
    ),

  create: (token: string, body: ChampionshipInput) =>
    fetch(`${API_BASE}/championships`, {
      method: 'POST',
      headers: json(token),
      body: JSON.stringify(body),
    }).then((r) => handle<ChampionshipData>(r)),

  update: (token: string, id: number | string, body: ChampionshipInput) =>
    fetch(`${API_BASE}/championships/${id}`, {
      method: 'PUT',
      headers: json(token),
      body: JSON.stringify(body),
    }).then((r) => handle<ChampionshipData>(r)),

  delete: (token: string, id: number | string) =>
    fetch(`${API_BASE}/championships/${id}`, {
      method: 'DELETE',
      headers: json(token),
    }).then((r) => handle<void>(r)),

  createSubscription: (
    token: string,
    championshipId: number | string,
    body: {
      category_id: number;
      player_ids: number[];
    },
  ) =>
    fetch(`${API_BASE}/championships/${championshipId}/subscriptions`, {
      method: 'POST',
      headers: json(token),
      body: JSON.stringify(body),
    }).then((r) => handle<ChampionshipSubscriptionData>(r)),

  getMatches: (token: string, championshipId: number | string, categoryId: number) =>
    fetch(`${API_BASE}/championships/${championshipId}/matches?category_id=${categoryId}`, {
      headers: json(token),
    }).then((r) => handle<ChampionshipMatchesData>(r)),

  updateMatchScore: (
    token: string,
    championshipId: number | string,
    matchId: number | string,
    body: { scores_1?: Array<number | null>; scores_2?: Array<number | null> },
  ) =>
    fetch(`${API_BASE}/championships/${championshipId}/matches/${matchId}/score`, {
      method: 'PATCH',
      headers: json(token),
      body: JSON.stringify(body),
    }).then((r) => handle<ChampionshipMatchOut>(r)),

  uploadImage: async (token: string, id: number | string, dataUrl: string): Promise<{ url: string }> => {
    const [, base64] = dataUrl.split(',');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const form = new FormData();
    form.append('file', blob, 'championship.jpg');
    const res = await fetch(`${API_BASE}/championships/${id}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    return handle<{ url: string }>(res);
  },
};

export interface ChampionshipTeamOut {
  id: number;
  name: string;
  user_ids: number[];
}

export interface ChampionshipMatchOut {
  id: number;
  match_number: number;
  group_name: string | null;
  stage_type: string | null;
  round_number: number;
  status: string;
  team_1: ChampionshipTeamOut | null;
  team_2: ChampionshipTeamOut | null;
  winner_team_id: number | null;
  score_json: {
    sets_1?: number;
    sets_2?: number;
    scores_1?: Array<number | null>;
    scores_2?: Array<number | null>;
  } | null;
  scheduled_at: string | null;
  config_json: Record<string, unknown> | null;
}

export interface ChampionshipStandingRow {
  team: ChampionshipTeamOut;
  wins: number;
  losses: number;
  points: number;
}

export interface PlayerStandingRow {
  user_id: number;
  name: string;
  wins: number;
  losses: number;
  points: number;
}

export interface ChampionshipTableOut {
  name: string;
  standings: ChampionshipStandingRow[];
  matches: ChampionshipMatchOut[];
  player_standings: PlayerStandingRow[];
}

export interface ChampionshipBracketRound {
  name: string;
  stage_type: string | null;
  matches: ChampionshipMatchOut[];
}

export interface ChampionshipBracketOut {
  name: string;
  winner_rounds: ChampionshipBracketRound[];
  loser_rounds: ChampionshipBracketRound[];
  grand_final: ChampionshipMatchOut | null;
}

export interface CategoryMatchSettingsOut {
  stage_type: string;
  max_sets: number;
  sets_to_win: number;
}

export interface ChampionshipMatchesData {
  format_slug: string;
  category_id: number;
  tables: ChampionshipTableOut[];
  brackets: ChampionshipBracketOut[];
  match_settings: CategoryMatchSettingsOut[];
  user_can_edit_scores: boolean;
}

export interface ChampionshipSubscriptionApproval {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  category_slug: string;
  audience_slug: string;
  team_user_ids: number[];
  status: string;
  created_at: string;
}

export const championshipSubscriptionsApi = {
  listMine: (token: string, page = 1, perPage = 12) =>
    fetch(`${API_BASE}/championship-subscriptions/me?page=${page}&per_page=${perPage}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<ChampionshipSubscriptionListItem>>(r)),

  update: (token: string, subscriptionId: number, body: { category_id: number; player_ids: number[] }) =>
    fetch(`${API_BASE}/championship-subscriptions/me/${subscriptionId}`, {
      method: 'PATCH',
      headers: json(token),
      body: JSON.stringify(body),
    }).then((r) => handle<ChampionshipSubscriptionData>(r)),

  listWaitingApproval: (token: string, championshipId: number | string, page = 1, perPage = 12) =>
    fetch(`${API_BASE}/championship-subscriptions/management/${championshipId}?page=${page}&per_page=${perPage}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<ChampionshipSubscriptionApproval>>(r)),

  approve: (token: string, subscriptionId: number) =>
    fetch(`${API_BASE}/championship-subscriptions/${subscriptionId}/approve`, {
      method: 'POST',
      headers: json(token),
    }).then((r) => handle<ChampionshipSubscriptionData>(r)),

  reject: (token: string, subscriptionId: number) =>
    fetch(`${API_BASE}/championship-subscriptions/${subscriptionId}/reject`, {
      method: 'POST',
      headers: json(token),
    }).then((r) => handle<void>(r)),
};

export interface ComplexPreferenceData {
  complex_id: number;
  asaas_wallet_id: string | null;
  split_percentage: number;
  week_schedule: unknown[];
  holidays: unknown[];
  payment_methods: string[];
  classes_payment_methods: string[];
  rental_payment_methods: string[];
  championship_payment_methods: string[];
  pricing_rules: unknown[];
}

export interface PixChargeData {
  charge_id: string;
  qr_code_image: string;
  qr_code_payload: string;
  expiration_date: string | null;
}

export interface PayPaymentResponse {
  payment: { id: number; status: string; total_amount: number };
  pix_charge: PixChargeData | null;
}

export const complexPreferencesApi = {
  get: (token: string, complexId: number) =>
    fetch(`${API_BASE}/complexes/${complexId}/preferences`, {
      headers: json(token),
    }).then((r) => handle<ComplexPreferenceData>(r)),

  update: (token: string, complexId: number, data: Partial<ComplexPreferenceData>) =>
    fetch(`${API_BASE}/complexes/${complexId}/preferences`, {
      method: 'PUT',
      headers: json(token),
      body: JSON.stringify(data),
    }).then((r) => handle<ComplexPreferenceData>(r)),
};

export const paymentsApi = {
  list: (
    token: string,
    {
      page = 1,
      perPage = 20,
      sourceType,
      sourceId,
      status,
      complexId,
    }: {
      page?: number;
      perPage?: number;
      sourceType?: string;
      sourceId?: number | string;
      status?: string;
      complexId?: number | string;
    } = {},
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (sourceType && sourceType !== 'all') params.set('source_type', sourceType);
    if (sourceId != null && sourceId !== 'all') params.set('source_id', String(sourceId));
    if (status && status !== 'all') params.set('status', status);
    if (complexId != null && complexId !== 'all') params.set('complex_id', String(complexId));
    return fetch(`${API_BASE}/payments?${params.toString()}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<PaymentData>>(r));
  },

  get: (token: string, paymentId: number | string) =>
    fetch(`${API_BASE}/payments/${paymentId}`, {
      headers: json(token),
    }).then((r) => handle<PaymentData>(r)),

  pay: (
    token: string,
    paymentId: number | string,
    method: string,
    billing?: {
      cpf?: string;
      card_name?: string;
      card_number?: string;
      card_expiry?: string;
      card_cvv?: string;
      address_street?: string;
      address_number?: string;
      address_complement?: string;
      address_neighborhood?: string;
      address_city?: string;
      address_state?: string;
      address_zip?: string;
    },
  ) =>
    fetch(`${API_BASE}/payments/${paymentId}/pay`, {
      method: 'POST',
      headers: json(token),
      body: JSON.stringify({ method, ...billing }),
    }).then((r) => handle<PayPaymentResponse>(r)),
};

export interface AdminComplex {
  id: number;
  name: string;
  city: string | null;
  country: string | null;
  is_active: boolean;
  image_url: string | null;
  split_percentage: number | null;
}

export const adminApi = {
  listComplexes: (token: string) =>
    fetch(`${API_BASE}/admin/complexes`, { headers: json(token) }).then(
      (r) => handle<AdminComplex[]>(r),
    ),

  updateComplexSplit: (token: string, complexId: number, splitPercentage: number) =>
    fetch(`${API_BASE}/admin/complexes/${complexId}/preferences`, {
      method: 'PATCH',
      headers: json(token),
      body: JSON.stringify({ split_percentage: splitPercentage }),
    }).then((r) => handle<{ ok: boolean }>(r)),

  deleteComplex: (token: string, complexId: number | string) =>
    fetch(`${API_BASE}/admin/complexes/${complexId}`, {
      method: 'DELETE',
      headers: json(token),
    }).then((r) => handle<void>(r)),
};
