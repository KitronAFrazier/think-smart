import { cookies } from "next/headers";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

function getSupabaseEnv():
  | {
      supabaseUrl: string;
      supabaseAnonKey: string;
    }
  | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseServerClient(accessToken?: string): SupabaseClient {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export async function getServerAuthContext(): Promise<{
  client: SupabaseClient;
  user: User;
  accessToken: string;
} | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });

  async function getUserFromAccessToken(token: string): Promise<User | null> {
    try {
      const result = await Promise.race([
        client.auth.getUser(token),
        new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 2000);
        }),
      ]);

      if (!result) {
        return null;
      }

      return result.data.user;
    } catch {
      return null;
    }
  }

  if (accessToken) {
    const user = await getUserFromAccessToken(accessToken);
    if (user) {
      return { client, user, accessToken };
    }
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const refreshResult = await Promise.race([
      client.auth.refreshSession({ refresh_token: refreshToken }),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 2000);
      }),
    ]);

    if (!refreshResult) {
      return null;
    }

    const { data, error } = refreshResult;
    if (error || !data.session || !data.user) {
      return null;
    }

    return { client, user: data.user, accessToken: data.session.access_token };
  } catch {
    return null;
  }
}
