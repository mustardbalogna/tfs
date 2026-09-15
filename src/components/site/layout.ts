export const COLUMN_CLASSES: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export const TONE_CLASSES = {
  plain: "",
  card: "bg-card",
  tinted: "bg-secondary/30",
} as const;
