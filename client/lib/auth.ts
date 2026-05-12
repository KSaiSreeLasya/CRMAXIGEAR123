import { supabase } from "./supabase";

const EMPLOYEE_SESSION_KEY = "employee_session";

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("auth_token");
  return !!token;
};

/** Copy Supabase session access token into auth_token so ProtectedRoute stays in sync. */
export async function hydrateAuthTokenFromSupabase(): Promise<void> {
  if (!supabase) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    localStorage.setItem("auth_token", session.access_token);
  }
}

export const logout = (): void => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem(EMPLOYEE_SESSION_KEY);
  if (supabase) {
    supabase.auth.signOut();
  }
};

export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
};

export const setEmployeeSession = (session: {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
}) => {
  localStorage.setItem("auth_token", `employee-${session.employeeId}`);
  localStorage.setItem(EMPLOYEE_SESSION_KEY, JSON.stringify(session));
};

export const getEmployeeSession = (): {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
} | null => {
  const raw = localStorage.getItem(EMPLOYEE_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
