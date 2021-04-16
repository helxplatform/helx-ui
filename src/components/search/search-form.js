import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { Input } from '../input'
import { Button } from '../button'
import { Container } from '../layout';
import { useHelxSearch } from './search-context'
import { InputGroup } from '../input-group'

const SearchBarContainer = styled(Container)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`

const SearchBarInputGroup = styled(InputGroup)`
    width: 70%;
`

const LaunchAppButton = styled(Button)`
    margin-left: 20px;
    border-radius: 5px;
    width: 10%;
`

export const SearchForm = () => {
  const { query, doSearch, inputRef, launchApp, resultSelected } = useHelxSearch()
  const [searchTerm, setSearchTerm] = useState(query)

  const handleChangeQuery = event => setSearchTerm(event.target.value)

  const handleKeyDown = event => {
    if (event.keyCode === 13) {
      doSearch(searchTerm)
    }
  }

  // This enables a two-way binding from this component's state (searchTerm) and that provided by the search-context,
  // ..but only when a new search is executed.
  // This component maintains the query seen in the input field (named `searchTerm`).
  // This state (searchTerm) must be explicitly updated to match the context's query when the context's query changes.
  // (Note that the converse relationship is already handled by the doSearch function.)
  useEffect(() => setSearchTerm(query), [query])

  return (
    <SearchBarContainer>
      <SearchBarInputGroup>
        <Input placeholder="Search HeLx" ref={inputRef} value={searchTerm} onChange={handleChangeQuery} onKeyDown={handleKeyDown} style={{ flex: 1 }} />
        <Button small onClick={() => doSearch(searchTerm)}>Search</Button>
      </SearchBarInputGroup>
      {/* <LaunchAppButton small onClick={launchApp}>Launch App</LaunchAppButton> */}
    </SearchBarContainer>
  )
}
