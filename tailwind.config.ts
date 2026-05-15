import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'oda-yellow': '#F8C915',
        'oda-yellow-2': '#FFD84D',
        'oda-green': '#198A2E',
        'oda-green-dark': '#0F6A22',
        'oda-charcoal': '#151515',
        'oda-charcoal-2': '#2A2A2A',
        'oda-ivory': '#FFFDF5',
        'oda-mint': '#EAF8EF',
        'oda-card': '#FFFFFF',
        'oda-blue': '#1E88E5',
        'oda-red': '#E53935',
        'oda-orange': '#FB8C00',
        'oda-gold': '#D9A441',
        'oda-purple': '#7B61FF',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        button: '14px',
        'category-card': '20px',
        'product-card': '18px',
        'modal-sheet': '28px',
        'bottom-nav': '34px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(21,21,21,0.08)',
        floating: '0 16px 40px rgba(21,21,21,0.12)',
        pressed: '0 4px 12px rgba(21,21,21,0.08)',
        glass: '0 8px 32px rgba(21,21,21,0.06)',
      },
      backdropBlur: {
        glass: '18px',
        'glass-strong': '28px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'cart-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.24s ease-out',
        'cart-bounce': 'cart-bounce 0.3s ease-in-out',
      },
    },
  },
  plugins: [animate],
};

export default config;
