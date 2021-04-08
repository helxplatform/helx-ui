import React, { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Container } from '../components/layout'
import { Title, Heading, Paragraph } from '../components/typography'
import HeLxLogo from '../images/helx-logo-blue.svg';

const HomeContainer = styled(Container)`
  display: flex;
  flex-direction: row;
  align-items: center;
`
const HeLxImage = styled.img`
  width: 30vw;
`

const HeLxIntro = styled.div`
  width: 80vw;
`

export const Home = () => {
  return (
    <Container>
      <Title>HeLx</Title>
      <HomeContainer>
        <HeLxIntro>
          The HeLx AppStore is the primary user experience component of the HeLx
          data science platform. Through the AppStore, users discover and interact
          with analytic tools and data to explore scientific problems. Its ability
          to empower researchers to leverage advanced analytical tools without
          installation or other infrastructure concerns has broad reaching benefits
          and can be applied in many domains.
      </HeLxIntro>
      </HomeContainer>
    </Container>
  )
}
