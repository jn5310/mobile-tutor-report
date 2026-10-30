/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 종이/먹 톤의 중립색
        paper: '#F4F1EA',
        line: '#E3DED3',
        ink: {
          DEFAULT: '#1F1E1B',
          soft: '#5F5B53',
          mute: '#9B968B',
        },
        // 포인트: 칠판색
        brand: {
          DEFAULT: '#1F4D3F',
          dark: '#163A2F',
          tint: '#E6EEEA',
        },
        // 과목 색: 국어 = 주묵, 수학 = 남색
        kor: {
          DEFAULT: '#9A3B2E',
          tint: '#F5E7E3',
        },
        math: {
          DEFAULT: '#2B4C7E',
          tint: '#E4EAF3',
        },
        marker: '#F3DC7A',
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      fontSize: {
        '2xs': ['11px', '15px'],
      },
    },
  },
  plugins: [],
}
