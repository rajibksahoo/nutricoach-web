export interface ClientUser {
  id: string;
  name: string;
  phone: string;
  coachId: string;
}

export function saveClientAuth(token: string, client: ClientUser) {
  localStorage.setItem("nc_client_token", token);
  localStorage.setItem("nc_client", JSON.stringify(client));
}

export function getClientToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("nc_client_token") : null;
}

export function getClientUser(): ClientUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("nc_client");
  return raw ? JSON.parse(raw) : null;
}

export function clearClientAuth() {
  localStorage.removeItem("nc_client_token");
  localStorage.removeItem("nc_client");
}

export function isClientAuthenticated(): boolean {
  return !!getClientToken();
}
