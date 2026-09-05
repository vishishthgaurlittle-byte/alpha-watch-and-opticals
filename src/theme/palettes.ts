export type ThemeId = "obsidian" | "midnight" | "oxblood" | "emerald" | "platinum";

export const THEME_IDS: ThemeId[] = ["obsidian", "midnight", "oxblood", "emerald", "platinum"];

export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  paper: string;
  paperText: string;
  border: string;
  shadow: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  description: string;
  tokens: ThemeTokens;
  previewDots: [string, string, string, string, string, string]; // [bg, surface, surface2, accent, text, paper]
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  obsidian: {
    id: "obsidian",
    name: "Obsidian & Champagne",
    subtitle: "Classic Horology & Warm Champagne",
    description: "Deep obsidian noir accented with refined champagne gold. Timeless, understated, and versatile.",
    tokens: {
      bg: "#0A0A0A",
      surface: "#161616",
      surface2: "#1F1F1F",
      text: "#F4EFE6",
      textMuted: "#B9B1A3",
      accent: "#C6A667",
      accentHover: "#E8D5B0",
      accentMuted: "#7A6A4F",
      paper: "#F7F3EC",
      paperText: "#1A1714",
      border: "rgba(198,166,103,0.22)",
      shadow: "0 20px 50px rgba(0,0,0,0.45)"
    },
    previewDots: ["#0A0A0A", "#161616", "#1F1F1F", "#C6A667", "#F4EFE6", "#F7F3EC"]
  },
  midnight: {
    id: "midnight",
    name: "Midnight & Rose Gold",
    subtitle: "Deep Oceanic Navy & Soft Rose Gold",
    description: "A rich midnight navy depth paired with glowing rose gold highlights for exceptional warmth.",
    tokens: {
      bg: "#07101C",
      surface: "#122033",
      surface2: "#1A2C44",
      text: "#F6F1EA",
      textMuted: "#C4B8B0",
      accent: "#B76E79",
      accentHover: "#E8C4B8",
      accentMuted: "#8A5A62",
      paper: "#F6F1EA",
      paperText: "#122033",
      border: "rgba(183,110,121,0.25)",
      shadow: "0 20px 50px rgba(7,16,28,0.5)"
    },
    previewDots: ["#07101C", "#122033", "#1A2C44", "#B76E79", "#F6F1EA", "#C4B8B0"]
  },
  oxblood: {
    id: "oxblood",
    name: "Oxblood Maison",
    subtitle: "Velvet Burgundy & Warm Brass",
    description: "Intense burgundy wine tones with antique warm brass accents evoking bespoke leather ateliers.",
    tokens: {
      bg: "#1A0B0E",
      surface: "#3B1218",
      surface2: "#4A181F",
      text: "#F3EBE3",
      textMuted: "#CDBEB0",
      accent: "#C9A96E",
      accentHover: "#E6D5B8",
      accentMuted: "#6E4E32",
      paper: "#F3EBE3",
      paperText: "#1A0B0E",
      border: "rgba(201,169,110,0.25)",
      shadow: "0 20px 50px rgba(26,11,14,0.5)"
    },
    previewDots: ["#1A0B0E", "#3B1218", "#4A181F", "#C9A96E", "#F3EBE3", "#CDBEB0"]
  },
  emerald: {
    id: "emerald",
    name: "Emerald Atelier",
    subtitle: "Deep Forest Pine & Luminous Gold",
    description: "Lush botanical jewel tones framed with radiant brushed gold, inspired by classic Swiss watchmaking.",
    tokens: {
      bg: "#071411",
      surface: "#12352C",
      surface2: "#18443A",
      text: "#F3EEE4",
      textMuted: "#C5D4CC",
      accent: "#C5A572",
      accentHover: "#A7C4B5",
      accentMuted: "#6B8F80",
      paper: "#F3EEE4",
      paperText: "#071411",
      border: "rgba(197,165,114,0.25)",
      shadow: "0 20px 50px rgba(7,20,17,0.5)"
    },
    previewDots: ["#071411", "#12352C", "#18443A", "#C5A572", "#F3EEE4", "#C5D4CC"]
  },
  platinum: {
    id: "platinum",
    name: "Platinum Optical",
    subtitle: "Crisp Slate & Precision Amber",
    description: "Sleek industrial slate and platinum monochrome balanced by crisp amber detailing for optical precision.",
    tokens: {
      bg: "#101418",
      surface: "#1C242C",
      surface2: "#253039",
      text: "#F4F6F8",
      textMuted: "#C5CDD4",
      accent: "#B08D57",
      accentHover: "#C5CDD4",
      accentMuted: "#9AA7B2",
      paper: "#F4F6F8",
      paperText: "#101418",
      border: "rgba(176,141,87,0.25)",
      shadow: "0 20px 50px rgba(16,20,24,0.5)"
    },
    previewDots: ["#101418", "#1C242C", "#253039", "#B08D57", "#F4F6F8", "#C5CDD4"]
  }
};

export const DEFAULT_THEME: ThemeId = "obsidian";

export function isValidThemeId(id: any): id is ThemeId {
  return typeof id === "string" && THEME_IDS.includes(id as ThemeId);
}
