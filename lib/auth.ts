export interface CoachUser {
  id: string;
  name: string;
  phone: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}

export function saveAuth(token: string, coach: CoachUser) {
  localStorage.setItem("nc_token", token);
  localStorage.setItem("nc_coach", JSON.stringify(coach));
}

export function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("nc_token") : null;
}

export function getCoach(): CoachUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("nc_coach");
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem("nc_token");
  localStorage.removeItem("nc_coach");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
