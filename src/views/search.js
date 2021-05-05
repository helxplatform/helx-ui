import React from 'react'
import { Container } from '../components/layout'
import { Title } from '../components/typography'
import { HelxSearch, SearchForm, SearchResults } from '../components/search'
import { WorkSpaceTabGroup } from '../components/workspace/workspace-tab-group';
import { useAuth } from '../contexts/';

export const Search = () => {
  
  return (
    <Container>
      <WorkSpaceTabGroup tab="search" />
      <HelxSearch>
        <SearchForm />
        <SearchResults />
      </HelxSearch>
    </Container>
  )
}
