/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#020617', // slate-950
                cyan: {
                    400: '#22d3ee',
                },
                indigo: {
                    400: '#818cf8',
                },
                emerald: {
                    400: '#34d399',
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'scroll-x': 'scrollX 20s linear infinite'
            },
            keyframes: {
                scrollX: {
                    '0%': { transform: 'translateX(100vw)' },
                    '100%': { transform: 'translateX(-100%)' }
                }
            }
        },
    },
    plugins: [],
}
