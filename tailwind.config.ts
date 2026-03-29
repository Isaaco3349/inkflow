import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#07050F',
          1: '#0E0B1C',
          2: '#150F28',
          3: '#1C1535',
        },
        purple: {
          DEFAULT: '#7B5FFF',
          hi: '#9B83FF',
          lo: 'rgba(123,95,255,0.15)',
        },
        violet: {
          DEFAULT: '#B46EFF',
          lo: 'rgba(180,110,255,0.1)',
        },
        ink: {
          text: '#EDE9FF',
          muted: 'rgba(237,233,255,0.45)',
          border: 'rgba(123,95,255,0.18)',
          'border-hi': 'rgba(123,95,255,0.35)',
        },
      },
      fontFamily: {
        head: ['Cabinet Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
