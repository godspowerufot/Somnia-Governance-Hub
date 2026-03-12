/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#000000",
                foreground: "#FFFFFF",
                primary: "#FFFFFF",
                accent: "#00FF88",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            borderWidth: {
                DEFAULT: "1px",
            },
        },
    },
    plugins: [],
};

