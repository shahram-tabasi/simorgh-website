export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        space: {
          0: '#04060e',
          1: '#070b18',
          2: '#0b1226',
          3: '#101a35',
        },
        line: 'rgba(120, 160, 255, 0.14)',
        blue: {
          DEFAULT: '#2b6bff',
          soft: '#5c8dff',
          deep: '#1741b8',
        },
        cyan: {
          DEFAULT: '#2ad3f0',
          soft: '#7ce6f7',
        },
        violet: {
          DEFAULT: '#7c5cff',
          soft: '#a48bff',
        },
        gold: {
          DEFAULT: '#e8b65a',
        },
        ink: {
          DEFAULT: '#e7edff',
          muted: '#9fb0d8',
          faint: '#6d7fa8',
        },
      },
      fontFamily: {
        display: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.18em',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },
      maxWidth: {
        shell: '1400px',
      },
      transitionTimingFunction: {
        sim: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
}
