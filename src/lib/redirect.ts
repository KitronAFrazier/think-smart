export function resolveRedirectPath(input: string | null | undefined, fallback = "/dashboard"): string {
  if (!input) {
    return fallback;
  }

  if (!input.startsWith("/") || input.startsWith("//")) {
    return fallback;
  }

  return input;
}
