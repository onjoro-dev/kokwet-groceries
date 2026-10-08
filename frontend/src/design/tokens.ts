export const colors = {
  brand: {
    50: "#F1FAF3", 100: "#DFF3E4", 200: "#B8E4C4", 300: "#8CD3A0",
    400: "#57B975", 500: "#2F9C52", 600: "#1F7F3F", 700: "#186633",
    800: "#144F29", 900: "#0F3A1E",
  },
  accent: { 50: "#FFF4EA", 100: "#FFE3C7", 400: "#FF9F40", 500: "#F5821F", 600: "#DA6A0C" },
  ink: { 50: "#F7F8F7", 100: "#EDF1ED", 300: "#CBD5CE", 500: "#66736A", 700: "#27372D", 900: "#17211A" },
  danger: { 50: "#FEF3F2", 600: "#DC2626", 700: "#B91C1C" },
} as const;

export const spacing = {
  1: "0.25rem", 2: "0.5rem", 3: "0.75rem", 4: "1rem", 5: "1.25rem",
  6: "1.5rem", 8: "2rem", 10: "2.5rem", 12: "3rem", 16: "4rem",
} as const;
export const radius = { sm: "0.5rem", md: "0.75rem", lg: "1rem", xl: "1.5rem" } as const;
export const shadows = { card: "0 1px 3px rgba(15, 58, 30, 0.08), 0 1px 2px rgba(15, 58, 30, 0.06)", lift: "0 14px 35px rgba(15, 58, 30, 0.14)" } as const;
export const type = {
  xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem",
  display: "1.75rem", heading: "1.5rem",
} as const;

export const motion = { fast: "150ms", base: "200ms", slow: "300ms" } as const;
