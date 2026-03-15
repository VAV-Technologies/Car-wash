
import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme")

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
        xl: '3rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  	extend: {
      fontFamily: {
        sans: ["Satoshi", ...fontFamily.sans], // Prioritize Satoshi
        // mono: ['var(--font-geist-mono)', ...fontFamily.mono], // Keep if you use a specific mono font elsewhere
      },
  		colors: {
        // Direct brand colors (optional, primarily for utility classes if needed outside theme context)
        'brand-dark-blue': 'hsl(var(--brand-dark-blue-hsl))',      // #0D0D39
        'brand-light-gray': 'hsl(var(--brand-light-gray-hsl))',   // #F4F6FC
        'brand-white': 'hsl(var(--brand-white-hsl))',           // #FFFFFF
        'brand-green': 'hsl(var(--brand-green-hsl))', // For hack tool glow

        // ShadCN UI theme colors mapped to CSS variables from globals.css
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
        subtleGlow: {
          '0%, 100%': { textShadow: '0 0 5px hsl(var(--brand-green-hsl) / 0.4)', opacity: '0.95' },
          '50%': { textShadow: '0 0 15px hsl(var(--brand-green-hsl) / 0.6)', opacity: '1' },
        },
        pulseSubtlePrefix: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        spin: { // Ensure spin is defined if spin-slow is used
          to: {
            transform: 'rotate(360deg)',
          },
        },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'subtle-glow': 'subtleGlow 3s infinite ease-in-out',
        'pulse-subtle-prefix': 'pulseSubtlePrefix 1.5s infinite ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
