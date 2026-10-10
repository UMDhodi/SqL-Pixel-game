/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dungeon: {
          abyss: "#0a0f1d",
          chamber: "#0d1527",
          crypt: "#131e38",
          border: "#1e293b",
          highlight: "#334155",
        },
        mana: {
          core: "#00f2fe",
          glow: "#38bdf8",
          dark: "#006a70",
        },
        quest: {
          gold: "#fbbf24",
          amber: "#f59e0b",
          deep: "#e3aa00",
        },
        glyph: {
          emerald: "#10b981",
          crimson: "#ef4444",
          violet: "#a855f7",
        },
        parchment: {
          white: "#f8fafc",
          rune: "#94a3b8",
        }
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        code: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'pixel-sm': '2px 2px 0px 0px #030712',
        'pixel': '3px 3px 0px 0px #030712',
        'pixel-lg': '5px 5px 0px 0px #030712',
        'pixel-modal': '8px 8px 0px 0px #000000',
        'pixel-mana': '0 0 12px rgba(0, 242, 254, 0.35)',
        'pixel-crimson': '0 0 12px rgba(239, 68, 68, 0.35)',
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
      }
    },
  },
  plugins: [],
}
