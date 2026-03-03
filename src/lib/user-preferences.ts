import { cookies } from "next/headers";

export const USER_PREFERENCES_COOKIE = "tlb-user-preferences";

export type UserPreferences = {
  displayName?: string;
  schoolYearStartDate?: string;
};

function parsePreferencesCookie(value: string | undefined): UserPreferences {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as UserPreferences;
    return {
      displayName: typeof parsed.displayName === "string" ? parsed.displayName : undefined,
      schoolYearStartDate: typeof parsed.schoolYearStartDate === "string" ? parsed.schoolYearStartDate : undefined,
    };
  } catch {
    return {};
  }
}

export async function getServerUserPreferences(): Promise<UserPreferences> {
  const cookieStore = await cookies();
  const value = cookieStore.get(USER_PREFERENCES_COOKIE)?.value;
  return parsePreferencesCookie(value);
}

