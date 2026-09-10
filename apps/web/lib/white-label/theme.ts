import type { CSSProperties } from "react";

export interface WhiteLabelTheme {
  primaryColor: string;
  accentColor: string;
  welcomeMessage: string;
  logoUrl?: string;
  heroImageUrl?: string;
}

export const DEFAULT_THEME: WhiteLabelTheme = {
  primaryColor: "#9D7DC5",
  accentColor: "#533AFD",
  welcomeMessage: "Welcome to my practice",
};

export function normalizeTheme(raw: unknown): WhiteLabelTheme {
  if (!raw || typeof raw !== "object") return DEFAULT_THEME;
  const t = raw as Record<string, unknown>;
  return {
    primaryColor:
      typeof t.primaryColor === "string" ? t.primaryColor : DEFAULT_THEME.primaryColor,
    accentColor:
      typeof t.accentColor === "string" ? t.accentColor : DEFAULT_THEME.accentColor,
    welcomeMessage:
      typeof t.welcomeMessage === "string"
        ? t.welcomeMessage
        : DEFAULT_THEME.welcomeMessage,
    logoUrl: typeof t.logoUrl === "string" ? t.logoUrl : undefined,
    heroImageUrl: typeof t.heroImageUrl === "string" ? t.heroImageUrl : undefined,
  };
}

export function themeToCssVars(theme: WhiteLabelTheme): CSSProperties {
  return {
    // @ts-expect-error CSS custom properties
    "--wl-primary": theme.primaryColor,
    "--wl-accent": theme.accentColor,
  };
}

// BATCH3_APPLIED
