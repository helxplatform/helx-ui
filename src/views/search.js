import React from 'react'
import { Container } from '../components/layout'
import { Title } from '../components/typography'
import { HelxSearch, SearchForm, SearchResults } from '../components/search'
import { Link } from '../components/link'
import { useAuth } from '../contexts/';

export const Search = () => {
  
  return (
    <Container>
      <Title hidden>HeLx</Title>

      <HelxSearch>
        <SearchForm />
        <SearchResults />
      </HelxSearch>

    </Container>
  )
}
