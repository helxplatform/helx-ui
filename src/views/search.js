import React from 'react'
import { Container } from '../components/layout'
import { Title } from '../components/typography'
import { HelxSearch, SearchForm, SearchResults } from '../components/search'
import { Link } from '../components/link'

export const Search = () => {
  return (
    <Container>
      <Title>Search</Title>

      <br/>

      <HelxSearch>
        <SearchForm />

        <br /><br /><br />
        
        <SearchResults />
      
      </HelxSearch>
    </Container>
  )
}
