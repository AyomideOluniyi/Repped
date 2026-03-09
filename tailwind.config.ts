import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "selector" as const,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--rp-bg)",
          card:     "var(--rp-bg-card)",
          elevated: "var(--rp-bg-elevated)",
          overlay:  "var(--rp-bg-overlay)",
        },
        accent: {
          green:       "#39FF14",
          "green-dim": "#2BCC10",
          orange:      "#FF6B2B",
          "orange-dim":"#CC5522",
        },
        surface: {
          DEFAULT:  "var(--rp-surface)",
          elevated: "var(--rp-surface-elevated)",
          hover:    "var(--rp-surface-hover)",
        },
        border: {
          DEFAULT: "var(--rp-border)",
          subtle:  "var(--rp-border-subtle)",
          strong:  "var(--rp-border-strong)",
        },
        text: {
          primary:   "var(--rp-text-primary)",
          secondary: "var(--rp-text-secondary)",
          muted:     "var(--rp-text-muted)",
          disabled:  "var(--rp-text-disabled)",
        },
        status: {
          success: "#22C55E",
          error:   "#EF4444",
          warning: "#F59E0B",
          info:    "#3B82F6",
        },
      },
      fontFamily: {
        display: ["var(--font-satoshi)", "system-ui", "sans-serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        sans:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "accent-gradient": "linear-gradient(135deg, #39FF14 0%, #2BCC10 100%)",
        "orange-gradient": "linear-gradient(135deg, #FF6B2B 0%, #CC5522 100%)",
      },
      boxShadow: {
        glow:          "0 0 20px rgba(57,255,20,0.15)",
        "glow-orange": "0 0 20px rgba(255,107,43,0.15)",
        card:          "0 4px 24px rgba(0,0,0,0.15)",
        "card-hover":  "0 8px 32px rgba(0,0,0,0.25)",
        "inner-glow":  "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "fade-in":        "fadeIn 0.3s ease-out",
        "fade-up":        "fadeUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-up":    "slideInUp 0.3s ease-out",
        shimmer:          "shimmer 1.5s infinite",
        "pulse-glow":     "pulseGlow 2s ease-in-out infinite",
        "bounce-in":      "bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        spin:             "spin 1s linear infinite",
        "pr-celebrate":   "prCelebrate 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      keyframes: {
        fadeIn:       { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeUp:       { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { "0%": { transform: "translateX(100%)" }, "100%": { transform: "translateX(0)" } },
        slideInUp:    { "0%": { transform: "translateY(100%)" }, "100%": { transform: "translateY(0)" } },
        shimmer:      { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseGlow:    { "0%, 100%": { boxShadow: "0 0 20px rgba(57,255,20,0.15)" }, "50%": { boxShadow: "0 0 40px rgba(57,255,20,0.35)" } },
        bounceIn:     { "0%": { transform: "scale(0.3)", opacity: "0" }, "50%": { transform: "scale(1.05)" }, "70%": { transform: "scale(0.9)" }, "100%": { transform: "scale(1)", opacity: "1" } },
        prCelebrate:  { "0%": { transform: "scale(1)" }, "30%": { transform: "scale(1.2) rotate(-5deg)" }, "60%": { transform: "scale(1.15) rotate(5deg)" }, "100%": { transform: "scale(1) rotate(0)" } },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top":    "env(safe-area-inset-top)",
        "nav-height":  "4rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
