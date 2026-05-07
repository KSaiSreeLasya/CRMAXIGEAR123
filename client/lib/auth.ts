import { supabase } from "./supabase";

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("auth_token");
  return !!token;
};

export const logout = (): void => {
  localStorage.removeItem("auth_token");
  if (supabase) {
    supabase.auth.signOut();
  }
};

export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
};
