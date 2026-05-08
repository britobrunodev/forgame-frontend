const API_BASE = import.meta.env.API_URL ?? "/api/v1";

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

export interface AccessControlUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface ComplexRoleAssignment {
  sport_complex_id: number;
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

const json = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError((body as { detail?: string }).detail ?? res.statusText, res.status);
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
  level: string | null;
  preferred_sports: string[] | null;
  preferred_complexes: number[] | null;
  wins: number;
  losses: number;
  draws: number;
  sport_characteristics: Record<string, string[]> | null;
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
  level: string | null;
  preferred_sports: string[] | null;
  preferred_complexes: number[] | null;
  sport_characteristics: Record<string, string[]> | null;
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
  email: string;
  picture_url: string | null;
  level: string | null;
}

export interface ChampionshipSubscriptionData {
  payment_id: number;
  payment_status: string;
  total_amount: number;
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
  players_per_team: number;
  team_id: number;
  team_user_ids: number[];
  status: string;
  amount: number | null;
  payment_id: number | null;
  payment_status: string | null;
  payment_total_amount: number | null;
  payment_remaining_amount: number | null;
  start_date: string | null;
  created_at: string;
}

export interface PaymentTransactionData {
  id: number;
  reference: string;
  amount: number;
  method: string;
  status: string;
  paid_at: string | null;
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

  listPlayers: (token: string, page = 1, perPage = 20, search = '') =>
    fetch(`${API_BASE}/users/players?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<PlayerListItem>>(r)),
};

export const categoriesApi = {
  list: (token: string) =>
    fetch(`${API_BASE}/categories`, {
      headers: json(token),
    }).then((r) => handle<CategoryData[]>(r)),
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
      sport_complex_id: number;
      assignments: Array<{ user_id: number; role: string }>;
    },
  ) =>
    fetch(`${API_BASE}/access-control`, {
      method: "PUT",
      headers: json(token),
      body: JSON.stringify(payload),
    }).then((r) => handle<ComplexRoleAssignment[]>(r)),
};

export const authApi = {
  getMe: (token: string) =>
    fetch(`${API_BASE}/auth/me`, { headers: json(token) }).then((r) =>
      handle<AuthUser>(r),
    ),

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
  format_slug: string;
  category_slug: string;
  audience_slug: string;
  entry_fee: number | null;
  players_per_team: number;
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
  format_id: number | null;
  complex_id: number | null;
  complex_name: string | null;
  complex_city: string | null;
  owner_id: number | null;
  start_date: string | null;
  end_date: string | null;
  registration_deadline: string | null;
  status: 'draft' | 'open' | 'running' | 'closed' | 'finished';
  bracket_size: number | null;
  transmission_url: string | null;
  address_url: string | null;
  notes: string | null;
  uniform_included: boolean;
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
  format_id?: number | null;
  complex_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  registration_deadline?: string | null;
  status?: string;
  bracket_size?: number | null;
  transmission_url?: string | null;
  address_url?: string | null;
  notes?: string | null;
  uniform_included?: boolean;
  image_offset_x?: number;
  image_offset_y?: number;
  image_zoom?: number;
  config_json?: Record<string, unknown> | null;
  categories?: ChampionshipCategoryData[];
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

export const championshipSubscriptionsApi = {
  listMine: (token: string, page = 1, perPage = 12) =>
    fetch(`${API_BASE}/championship-subscriptions/me?page=${page}&per_page=${perPage}`, {
      headers: json(token),
    }).then((r) => handle<PaginatedResponse<ChampionshipSubscriptionListItem>>(r)),
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

  pay: (token: string, paymentId: number | string, method: string) =>
    fetch(`${API_BASE}/payments/${paymentId}/pay`, {
      method: 'POST',
      headers: json(token),
      body: JSON.stringify({ method }),
    }).then((r) => handle<PaymentData>(r)),
};
