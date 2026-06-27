/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "rgba(0, 0, 0, 0.1)",
        input: "rgba(0, 0, 0, 0.1)",
        ring: "rgba(139, 92, 246, 0.5)", /* Lavender */
        background: "#F4F4F9", /* Very light cool background */
        foreground: "#1E293B", /* Dark slate text */
        primary: {
          DEFAULT: "rgba(139, 92, 246, 0.9)", /* Lavender primary */
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "rgba(0, 0, 0, 0.04)",
          foreground: "#334155",
        },
        destructive: {
          DEFAULT: "rgba(239, 68, 68, 0.9)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "rgba(0, 0, 0, 0.05)",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "rgba(139, 92, 246, 0.1)", /* Soft lavender accent */
          foreground: "#4C1D95",
        },
        popover: {
          DEFAULT: "rgba(255, 255, 255, 0.7)",
          foreground: "#1E293B",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.6)", /* Light frosted card */
          foreground: "#1E293B",
        },
        success: {
          DEFAULT: "rgba(16, 185, 129, 0.9)",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "rgba(245, 158, 11, 0.9)",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "rgba(239, 68, 68, 0.9)",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
