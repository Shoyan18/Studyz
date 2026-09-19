/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card-bg)",
          foreground: "var(--foreground)",
          border: "var(--card-border)",
        },
        coral: {
          50: "#FFF5F2",
          100: "#FFEAE4",
          200: "#FFD6CB",
          300: "#FFB8A5",
          400: "#FF8E72",
          500: "#FF704E",
          600: "#F0532E",
          700: "#C93D1C",
        },
        lavender: {
          50: "#F6F4FE",
          100: "#EFEAFF",
          200: "#DFD7FE",
          300: "#C3B4FD",
          400: "#A38DFB",
          500: "#8C7CFF",
          600: "#745EE8",
        },
        pastelYellow: {
          50: "#FFFDF0",
          100: "#FFFBE0",
          200: "#FEF4B8",
          300: "#FDE98A",
          400: "#FCD34D",
          500: "#F59E0B",
        },
        pastelMint: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
        },
        pastelSky: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
        },
        pastelRose: {
          50: "#FDF2F8",
          100: "#FCE7F3",
          200: "#FBCFE8",
          300: "#F472B6",
        },
        charcoal: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        }
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(230, 210, 200, 0.35)',
        'soft-lg': '0 10px 30px -4px rgba(230, 205, 195, 0.45)',
        'coral-glow': '0 8px 25px -4px rgba(255, 112, 78, 0.35)',
        'lavender-glow': '0 8px 25px -4px rgba(140, 124, 255, 0.3)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
