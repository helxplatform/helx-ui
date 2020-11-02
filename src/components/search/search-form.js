import React, { useEffect, useState } from 'react'
import { Input } from '../input'
import { Button } from '../button'
import { useHelxSearch } from './search-context'
import { InputGroup } from '../input-group'

export const SearchForm = () => {
  const { query, doSearch, inputRef } = useHelxSearch()
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
    <InputGroup>
      <Input ref={ inputRef } value={ searchTerm } onChange={ handleChangeQuery } onKeyDown={ handleKeyDown } style={{ flex: 1 }} />
      <Button small onClick={ () => doSearch(searchTerm) }>Search</Button>
    </InputGroup>
  )
}
