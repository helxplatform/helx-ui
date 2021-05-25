import React, { Fragment, useEffect, useState } from 'react'
import { Button, Form, Input } from 'antd'
import { useHelxSearch } from './'
import './search.css'

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
    <Form onFinish={ () => doSearch(searchTerm) } className="search-form">
      <Form.Item>
        <Input
          ref={inputRef}
          placeholder="Search for biomedical concept"
          value={searchTerm}
          onChange={handleChangeQuery}
          onKeyDown={handleKeyDown}
        />
      </Form.Item>
      <Form.Item>
        <Button>Search</Button>
      </Form.Item>
    </Form>
  )
}
