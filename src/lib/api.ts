function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

export function clearToken() {
  localStorage.removeItem("token");
  document.cookie = "token=; path=/; max-age=0";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erreur ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// Auth
export const authApi = {
  register: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string }; profile: Profile }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string }; profile: Profile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () =>
    request<{ id: string; email: string; profile: Profile }>("/auth/me"),

  resetPassword: (email: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Profile
export const profileApi = {
  get: () => request<Profile>("/profile"),

  update: (data: Partial<ProfileUpdate>) =>
    request<Profile>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const token = getToken();
    const form = new FormData();
    form.append("avatar", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Erreur ${res.status}`);
    }
    return res.json();
  },
};

// Types
export interface Profile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  personalDescription: string | null;
  role: string | null;
  status: string;
  isEmailVerified: boolean;
  skills: string[];
  associationContribution: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdate {
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  personalDescription: string;
  skills: string[];
  associationContribution: string;
}
