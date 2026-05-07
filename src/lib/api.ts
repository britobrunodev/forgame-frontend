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
  preferred_class_payment_method: string | null;
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
  preferred_class_payment_method: string | null;
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
  image_offset_y: number;
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
  image_offset_y?: number;
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
