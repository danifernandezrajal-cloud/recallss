import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0d0d0d',
        surface: '#141414',
        border:  '#2a2a2a',
        muted:   '#1e1e1e',
        subtle:  '#666666',
        accent:  '#818cf8',
      },
    },
  },
  plugins: [],
}

export default config
