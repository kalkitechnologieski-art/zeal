export const Role = {
  USER: "USER",
  HEALER: "HEALER",
  ADMIN: "ADMIN"
} as const;
export type Role = typeof Role[keyof typeof Role];

export const ConsultantCategory = {
  ASTROLOGER: "astrologer",
  PSYCHOLOGIST: "psychologist",
  TAROT: "tarot",
  NUMEROLOGIST: "numerologist",
  PALMIST: "palmist",
  VASTU: "vastu",
  REIKI: "reiki",
  LIFE_COACH: "life_coach",
  HEALER: "healer"
} as const;
export type ConsultantCategory = typeof ConsultantCategory[keyof typeof ConsultantCategory];

export const Faith = {
  HINDU: "HINDU",
  ISLAM: "ISLAM",
  CHRISTIAN: "CHRISTIAN",
  BUDDHIST: "BUDDHIST",
  JEWISH: "JEWISH",
  SIKH: "SIKH",
  OTHER: "OTHER"
} as const;
export type Faith = typeof Faith[keyof typeof Faith];
