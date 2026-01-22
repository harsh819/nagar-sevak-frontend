import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "staff" | "user";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: UserRole[];
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    roles: [],
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          session: session,
        }));

        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setAuthState((prev) => ({ ...prev, roles: [], loading: false }));
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session: session,
      }));

      if (session?.user) {
        fetchUserRoles(session.user.id);
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) throw error;

      const roles = (data || []).map((r) => r.role as UserRole);
      setAuthState((prev) => ({ ...prev, roles, loading: false }));
    } catch (error) {
      console.error("Error fetching user roles:", error);
      setAuthState((prev) => ({ ...prev, roles: [], loading: false }));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      session: null,
      loading: false,
      roles: [],
    });
  };

  const hasRole = (role: UserRole) => authState.roles.includes(role);
  const isAdmin = () => hasRole("admin");
  const isStaff = () => hasRole("staff") || hasRole("admin");

  return {
    ...authState,
    signOut,
    hasRole,
    isAdmin,
    isStaff,
  };
};
