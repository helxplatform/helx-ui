import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { AutoComplete, Button, Form, Input } from 'antd'
import { useDebouncedCallback } from 'use-debounce'
import Highlighter from 'react-highlight-words'
import Select from 'rc-select'
import { useHelxSearch } from '../'
import { SearchCompletion } from './search-suggestion'
import { useEnvironment } from '../../../contexts'
import { useAbortController } from '../../../hooks'
import './form.css'

// LEVENSHTEIN_SENSITIVITY=1 disables approximate searching 
const LEVENSHTEIN_SENSITIVITY = 0.8 // levenshtein_distance = ceil(search_length * (1 - sensitivity))
const LEVENSHTEIN_MAX = 3 // levenshtein distance caps out at a distance of 3
const MAX_SUGGESTIONS = 15
const DISALLOWED_SEARCH_CONCEPTS = ['biolink:Publication', 'biolink:ClinicalModifier']

const HighlightedText = ({ children }) => {
  return (
    <span style={{ fontWeight: "bold" }}>
      {children}
    </span>
  )
}

const HighlightedHistoryText = ({ children }) => {
  return (
    <span style={{ color: "#c7abff" }}>
      {children}
    </span>
  )
}

const highlightedSearchTerms = (highlightedSearch) => {
  const tokenChars = [
    ',', '.', '<', '>', '{', '}', '[', ']', '"', "'", ':', ';', '!', '@', '#', '$', '%', '^', '&', '*', '(',
    ')', '-', '+', '=', '~'
  ]
  const tokenCharsRe = new RegExp("[" + tokenChars.join("").replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "]", "gi")
  const searchWords = highlightedSearch.split(" ")
  return searchWords.flatMap((word) => word.split(tokenCharsRe))
}

export const SearchForm = () => {
  const { context } = useEnvironment()
  const { doSearch, inputRef, query, totalConcepts, searchHistory } = useHelxSearch()
  const [searchTerm, setSearchTerm] = useState(query)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [initialSuggestionsLoaded, setInitialSuggestionsLoaded] = useState(false)

  const abortController = useRef()

  const tranqlUrl = context.tranql_url

  const handleChangeQuery = event => {
    setSearchTerm(event.target.value)
    handleSearch(event.target.value)
  }

  const loadSearchSuggestions = async (value) => {
    if (abortController.current) abortController.current.abort()
    abortController.current = new AbortController()
    if (value.length <= 3) {
      setSearchSuggestions([])
      setLoadingSuggestions(false)
      return
    }
    setSearchSuggestions([])
    setLoadingSuggestions(true)
    const signal = abortController.current.signal
    try {
      const res = await fetch(`http://localhost:8001/tranql/autocomplete_term`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: value,
          prefix_search: true,
          // levenshtein_distance: Math.min(Math.ceil(value.length * (1 - LEVENSHTEIN_SENSITIVITY)), LEVENSHTEIN_MAX), 
          query_limit: 200
        }),
        signal
      })
      // await new Promise((resolve) => setTimeout(resolve, 2500))
      if (res.ok) {
        const hits = (
          await res.json()
        ).filter((hit) => (
          // Ensure none of the hit's labels are found in DISALLOWED_SEARCH_CONCEPTS (no intersection).
          !hit.labels.some((label) => DISALLOWED_SEARCH_CONCEPTS.includes(label))
        ))
        setSearchSuggestions(hits)
      } else {
        console.log("Search autocomplete failed")
        setSearchSuggestions([])
      }
      setLoadingSuggestions(false)
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e)
        setSearchSuggestions([])
        setLoadingSuggestions(false)
      }
    }
  }
  const handleSearch = useDebouncedCallback(loadSearchSuggestions, 200)

  const handleKeyDown = event => {
    if (event.keyCode === 13) {
      doSearch(searchTerm)
    }
  }

  const handleSelect = selection => {
    setSearchTerm(selection)
    doSearch(selection)
  }

  const searchSuggestionsWithHistory = useMemo(() => {
    if (searchSuggestions && searchHistory) {
      const suggestions = searchSuggestions.map((hit) => ({
          ...hit,
          searchHistoryEntry: searchHistory.find(({ search, time }) => hit.node.name === search.trim())
      }))
      const historySuggestions = suggestions
        .filter((x) => !!x.searchHistoryEntry)
        .sort((a, b) => b.score - a.score)
      const nonHistorySuggestions = suggestions
        .filter((x) => !x.searchHistoryEntry)
        .sort((a, b) => b.score - a.score)
      return [
        ...historySuggestions,
        ...nonHistorySuggestions
      ]
    } else return searchSuggestions
  }, [searchSuggestions, searchHistory])

  const searchCompletionDataSource = useMemo(() => {
    // Show previous searches as suggestions if the search query is empty.
    if (searchTerm === "") return (
      // Search history is already naturally in order (since newest searchs are appended to the history)
      // though it can't hurt to sort them here anyways in case this changes in the future.
      searchHistory.sort((a, b) => b.time - a.time).slice(0, MAX_SUGGESTIONS).map((historyEntry) => (
        <Select.Option key={historyEntry.search} value={historyEntry.search}>
          <SearchCompletion historyEntry={historyEntry}>
            {historyEntry.search}
          </SearchCompletion>
        </Select.Option>
      ))
    )
    return searchSuggestionsWithHistory.slice(0, MAX_SUGGESTIONS).map(({ searchHistoryEntry, ...hit }) => {
      return (
        <Select.Option key={hit.node.id} value={hit.node.name}>
          <SearchCompletion historyEntry={searchHistoryEntry}>
            <Highlighter textToHighlight={hit.node.name} searchWords={highlightedSearchTerms(searchTerm)} highlightTag={HighlightedText} />
          </SearchCompletion>
        </Select.Option>
      )
    })
  }, [searchSuggestionsWithHistory])

  useEffect(() => {
    if (searchTerm && !initialSuggestionsLoaded) {
      setInitialSuggestionsLoaded(true)
      loadSearchSuggestions(searchTerm)
    }
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
        <AutoComplete
          value={searchTerm}
          dataSource={searchCompletionDataSource}
          notFoundContent={loadingSuggestions ? "Loading" : "No results found"}
          onSelect={handleSelect}
          // onSearch={handleSearch}
        >
          <Input
            allowClear
            autoFocus
            ref={inputRef}
            placeholder="Enter search term"
            value={searchTerm}
            onChange={handleChangeQuery}
            onKeyDown={handleKeyDown}
          />
        </AutoComplete>
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit">Search</Button>
      </Form.Item>
    </Form>
  )
}
