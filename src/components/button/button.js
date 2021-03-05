import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'

const RIPPLE_DURATION = 500 // in milliseconds

export const Wrapper = styled.button(({ theme, variant, small }) => `
  background-color: ${ variant ? theme.color[variant] : theme.color.primary.main };
  color: ${ theme.color.white };
  padding: ${ theme.spacing[small ? 'small' : 'medium'] } ${ theme.spacing[small ? 'medium' : 'large' ] };
  border-radius: ${ theme.border.radius };
  border: 0;
  cursor: pointer;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
  outline: 0;
  transition: filter 250ms, background-color 250ms;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${ theme.spacing.small };
  &:disabled {
    filter: saturate(0.25);
    border: 1px solid red;
    cursor: default;
  }
  &:not(:disabled):hover {
    filter: brightness(0.9);
  }
  &:not(:disabled):active, &:not(:disabled):focus {
    filter: drop-shadow(0 0 4px ${ variant ? theme.color[variant] : theme.color.primary.main }cc);
  }
`)

const rippleEffect = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(10);
    opacity: 0;
  }
`

const Ripple = styled.span`
  position: absolute;
  left: -1;
  top: -1;
  transform: translate(-50%, -50%);
  content: "";
  display: block;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #ffffff99;
  pointer-events: none;
  animation: ${ RIPPLE_DURATION }ms ease 1 forwards ${ rippleEffect };
`

export const Button = ({ children, variant, onClick, ...props }) => {
  const [coords, setCoords] = useState({ x: -1, y: -1 })
  const [isRippling, setIsRippling] = useState(false)

  const handleClick = event => {
    // perform ripple animation
    const { left, top, width, height } = event.target.getBoundingClientRect()
    const { clientX, clientY } = event
    if (clientX === 0 && clientY === 0) {
      setCoords({ x: width / 2 - 15, y: height / 2  - 15})
    } else {
      setCoords({ x: clientX - left - 15, y: clientY - top - 15 }) // unsure why `-15` offset is needed here
    }
    // call passed-in click handler
    onClick && onClick()
  }

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true)
      setTimeout(() => setIsRippling(false), RIPPLE_DURATION)
    } else {
      setIsRippling(false)
    }
  }, [coords])

  useEffect(() => {
      if (!isRippling) setCoords({ x: -1, y: -1 })
    }, [isRippling])

  return (
    <Wrapper onClick={ handleClick } variant={ variant } { ...props }>
      { isRippling ? <Ripple style={{ left: coords.x, top: coords.y }} /> : null }
      { children }
    </Wrapper>
  )
}