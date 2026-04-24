import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

interface UseGoogleTokenResult {
  token: string | null;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

/**
 * Returns the Google provider_token from the current Supabase session.
 * Triggers a Google OAuth sign-in (linking) when `connect()` is called.
 */
export function useGoogleToken(): UseGoogleTokenResult {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const readSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setToken(data.session?.provider_token ?? null);
      setLoading(false);
    };

    readSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.provider_token ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const connect = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: GOOGLE_SCOPES,
        redirectTo: window.location.href,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  }, []);

  const disconnect = useCallback(() => {
    setToken(null);
  }, []);

  return { token, loading, connect, disconnect };
}
