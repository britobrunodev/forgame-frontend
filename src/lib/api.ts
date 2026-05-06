const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
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
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  requested_role: string;
  status: string;
  created_at: string;
}

const json = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((body as { detail?: string }).detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface PlayerProfile {
  name: string;
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
  wins: number;
  losses: number;
  draws: number;
  sport_characteristics: Record<string, string[]> | null;
  preferred_class_payment_method: string | null;
}

export interface PlayerProfileUpdateInput {
  name: string;
  document_type: string | null;
  document_number: string | null;
  phone_country: string | null;
  phone_number: string | null;
  country: string | null;
  uniform_size: string | null;
  level: string | null;
  sport_characteristics: Record<string, string[]> | null;
  preferred_class_payment_method: string | null;
}

export const usersApi = {
  uploadAvatar: async (token: string, dataUrl: string): Promise<{ url: string }> => {
    const [, base64] = dataUrl.split(',');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const form = new FormData();
    form.append('file', blob, 'avatar.jpg');
    const res = await fetch(`${API_BASE}/users/me/avatar`, {
      method: 'POST',
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
      method: 'PUT',
      headers: json(token),
      body: JSON.stringify(profile),
    }).then((r) => handle<PlayerProfile>(r)),
};

export const authApi = {
  googleLogin: (access_token: string, requested_profile: 'player' | 'gestor') =>
    fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: json(),
      body: JSON.stringify({ access_token, requested_profile }),
    }).then((r) => handle<AuthResponse>(r)),

  getApprovals: (token: string) =>
    fetch(`${API_BASE}/auth/approvals`, { headers: json(token) }).then((r) =>
      handle<ApprovalRequest[]>(r),
    ),

  approveRequest: (token: string, requestId: string) =>
    fetch(`${API_BASE}/auth/approvals/${requestId}/approve`, {
      method: 'POST',
      headers: json(token),
    }).then((r) => handle<{ message: string }>(r)),

  rejectRequest: (token: string, requestId: string) =>
    fetch(`${API_BASE}/auth/approvals/${requestId}/reject`, {
      method: 'POST',
      headers: json(token),
    }).then((r) => handle<{ message: string }>(r)),
};
