import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Typography, Divider, Radio } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useDebouncedCallback } from 'use-debounce'
import { useHelxSearch, SearchLayout} from '../'
import './form.css'

const { Link } = Typography

// If search is minimal (used in expanded view), remove the search button and automatically execute search on a debounce.
const MINIMAL = 'minimal'
const FULL = 'full'

export const SearchForm = ({ type=FULL, ...props }) => {
  const { doSearch, inputRef, query, totalConcepts, layout, setLayout } = useHelxSearch()
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

  const submitSearch = () => doSearch(searchTerm)

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
    <Form onFinish={ submitSearch } className={ `search-form ${ totalConcepts ? 'with-results' : 'without-results' }` } {...props}>
      <Form.Item>
        <Input
          allowClear
          autoFocus
          ref={inputRef}
          placeholder="Enter search term"
          value={searchTerm}
          onChange={handleChangeQuery}
          onKeyDown={handleKeyDown}
          suffix={
            type === MINIMAL ? (
              <div style={{ display: "flex", alignItems: "center", height: "100%"}}>
                <Divider type="vertical" style={{ height: "100%" }} />
                <SearchOutlined style={{ fontSize: "16px", marginLeft: "4px" }} />
              </div>
            ) : undefined
          }
        />
      </Form.Item>
      <Form.Item>
        {
          type === FULL && (
            <Button htmlType="submit" style={{ marginLeft: "16px" }}>Search</Button>
          )
          // <Link type="secondary" onClick={ submitSearch }><SearchOutlined style={{ fontSize: "16px" }} /></Link>
        }
      </Form.Item>
      { totalConcepts ? (
        <Form.Item>
          <Radio.Group
            options={[
                {
                  label: "Concepts",
                  value: "concepts",
                  key: "concepts"
                },
                {
                  label: "Variables",
                  value: "variables",
                  key: "variables"
                }
            ]}
            value={
              layout === SearchLayout.GRID || layout === SearchLayout.EXPANDED_RESULT ? (
                "concepts"
              ) : layout === SearchLayout.VARIABLE_VIEW ? (
                "variables"
              ) : null
            }
            onChange={ (e) => {
              switch (e.target.value) {
                case "concepts":
                  setLayout(SearchLayout.GRID)
                  break
                case "variables":
                  setLayout(SearchLayout.VARIABLE_VIEW)
                  break
                default:
                  console.error("Unimplemented layout type:", e.target.value)
                  break
              }
            } }
            optionType="button"
            style={{ marginLeft: 16 }}
          />
        </Form.Item>
      ) : null }
    </Form>
  )
}
