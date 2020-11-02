import React from 'react'
import PropTypes from 'prop-types'
import styled, { css, keyframes, useTheme } from 'styled-components'

const Wrapper = styled.div(({ theme }) => css`
  display: flex;
  justify-content: center;
  margin: 2rem;
  animation: ${ theme.animation.fadeIn };
`)

const revolve = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: rotate(180deg) scale(2);
    opacity: 1;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 0.5;
  }
`

const Orb = styled.circle`
  transform-origin: center center;
  animation-name: ${ revolve };
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-direction: normal;
  animation-timing-function: linear; /* ease, ease-in, ease-in-out, ease-out, linear, cubic-bezier(x1, y1, x2, y2) */
  animation-fill-mode: forwards;
  animation-delay: 0;
`

export const LoadingSpinner = ({ color, ...rest }) => {
  const theme = useTheme()
  const fill = color ? color : theme.color.primary.main
  return (
    <Wrapper>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" fill={ color }
        x="0px" y="0px" width="60px" height="60px" viewBox="0 0 60 60"
        { ...rest }
      >
        <Orb cx="30" cy="20" r="3" fill={ fill } />
        <Orb cx="30" cy="40" r="3" fill={ fill } />
      </svg>
    </Wrapper>
  )
}

LoadingSpinner.propTypes = {
  color: PropTypes.string,
}
