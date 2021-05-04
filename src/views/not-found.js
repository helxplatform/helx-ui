import React from 'react'
import { Container } from '../components/layout'
import { Link } from '@reach/router'
import { Paragraph, Title } from '../components/typography'

export const NotFound = () => {
  return (
    <Container>
      <Title>Page not found</Title>
      <Paragraph>Please try searching or go to <Link to='/helx'>HeLx homepage</Link>.</Paragraph>
    </Container>
  )
}
