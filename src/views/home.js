import React, { useState } from 'react'
import { Container } from '../components/layout'
import { Title, Heading, Paragraph } from '../components/typography'
import { useNotifications } from '../components/notifications'

export const Home = () => {
  const { addNotification } = useNotifications()
  return (
    <Container>
      <Title>HeLx</Title>

      <Paragraph>
        The HeLx AppStore is the primary user experience component of the HeLx
        data science platform. Through the AppStore, users discover and interact
        with analytic tools and data to explore scientific problems. Its ability
        to empower researchers to leverage advanced analytical tools without
        installation or other infrastructure concerns has broad reaching benefits
        and can be applied in many domains.
      </Paragraph>
  </Container>
  )
}
