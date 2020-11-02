import { css, keyframes } from 'styled-components'

const fade = keyframes`
  0% { opacity: 0.0; }
  100% { opacity: 1.0; }
`

export const theme = {
  color: {
    primary: {
      light: '#30d8f1',
      main: '#00a8c1',
      dark: '#007891',
    },
    extended: {
      crimson: '#9e0817',
      gold: 'gold',
    },
    black: '#181818',
    grey: {
      light: '#dddde3',
      main: '#889',
      dark: '#556',
    },
    transparent: 'transparent',
    white: '#f1f2f3',
    success: '#7ebb9b',
    info: '#49a0d9',
    warning: '#df9852',
    danger: '#c16a5d',
  },
  border: {
    radius: '3px',
    width: '1px',
  },
  spacing: {
    xs: '0.25rem', extraSmall: '0.25rem',
    sm: '0.5rem', small: '0.5rem',
    md: '1rem', medium: '1rem',
    lg: '2rem', large: '2rem',
    xl: '3rem', extraLarge: '3rem',
  },
  animation: {
    fadeIn: css`${ fade } 500ms ease-out normal`,
    fadeOut: css`${ fade } 500ms ease-out reverse`,
  },
  debug: `
    border: 1px solid #f99;
    * { border: 1px solid #f99; }
  `
}
