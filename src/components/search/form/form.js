import React, { useEffect, useState } from 'react'
import { Button, Form, Input } from 'antd'
import { useDebouncedCallback } from 'use-debounce'
import { useHelxSearch } from '../'
import './form.css'

// If search is minimal (used in expanded view), remove the search button and automatically execute search on a debounce.
const MINIMAL = 'minimal'
const FULL = 'full'

export const SearchForm = ({ type=FULL }) => {
  const { doSearch, inputRef, query, totalConcepts } = useHelxSearch()
  const [searchTerm, setSearchTerm] = useState(query)
  
  const executeDebouncedSearch = useDebouncedCallback(() => {
    doSearch(searchTerm)
  }, 500)

  const handleChangeQuery = event => setSearchTerm(event.target.value)

  const handleKeyDown = event => {
    if (event.keyCode === 13) {
      doSearch(searchTerm)
    }
  }

  useEffect(() => {
    // if (type === MINIMAL) executeDebouncedSearch()
  }, [searchTerm])

  // This enables a two-way binding from this component's state (searchTerm) and that provided by the search-context,
  // ..but only when a new search is executed.
  // This component maintains the query seen in the input field (named `searchTerm`).
  // This state (searchTerm) must be explicitly updated to match the context's query when the context's query changes.
  // (Note that the converse relationship is already handled by the doSearch function.)
  useEffect(() => setSearchTerm(query), [query])

  return (
    <Form onFinish={ () => doSearch(searchTerm) } className={ `search-form ${ totalConcepts ? 'with-results' : 'without-results' }` }>
      <Form.Item>
        <Input
          allowClear
          autoFocus
          ref={inputRef}
          placeholder="Enter search term"
          value={searchTerm}
          onChange={handleChangeQuery}
          onKeyDown={handleKeyDown}
        />
      </Form.Item>
      {type === FULL && (
        <Form.Item>
          <Button htmlType="submit">Search</Button>
        </Form.Item>
      )}
    </Form>
  )
}
