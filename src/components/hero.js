import React from 'react'
import styled, { css, keyframes } from 'styled-components'
import { useScrollPosition } from '../hooks'

const zoomIn = keyframes`
    0% {
        opacity: 0.0;
        transform: perspective(500px) translateZ(0px);
    }
    100% {
        opacity: 1.0;
        transform: perspective(500px) translateZ(20px);
    }
`

const Wrapper = styled.div(({ theme }) => `
  background-color: ${ theme.color.grey.light };
  color: ${ theme.color.white };
  height: 300px;
  position: relative;
  z-index: 0;
  overflow: hidden;
`)

const Background = styled.div(({ image, yShift }) => css`
  animation: ${ zoomIn } 500ms ease-out forwards;
  background-image: url(${ image });
  background-size: cover;
  background-position: center calc(50% + ${ yShift }px);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`)

const Contents = styled.div(({ theme }) => `
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
`)

export const Hero = ({ backgroundImage, children }) => {
  const scrollPosition = useScrollPosition()
  return (
    <Wrapper>
      <Background image={ backgroundImage } yShift={ scrollPosition / 3 } />
      <Contents>
        { children }
      </Contents>
    </Wrapper>
  )
}
