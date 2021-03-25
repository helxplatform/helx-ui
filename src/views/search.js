import React from 'react'
import { Container } from '../components/layout'
import { Title } from '../components/typography'
import { HelxSearch, SearchForm, SearchResults } from '../components/search'
import { Link } from '../components/link'
import { Whitelist } from '../views/whitelist';
import { useEnvironment } from '../contexts/';

export const Search = () => {
  const { isAuth } = useEnvironment();

  if (!isAuth) return <Whitelist />

  return (
    <Container>
      <Title>Search</Title>

      <br />

      <HelxSearch>
        <SearchForm />

        <br /><br /><br />

        <SearchResults />

      </HelxSearch>
    </Container>
  )
}
