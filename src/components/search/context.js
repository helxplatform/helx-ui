import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from '@reach/router'
import { useEnvironment } from '../../contexts'
import './search.css'

//

export const HelxSearchContext = createContext({})
export const useHelxSearch = () => useContext(HelxSearchContext)

//

const PER_PAGE = 20

//

export const HelxSearch = ({ children }) => {
  const { helxSearchUrl } = useEnvironment()
  const [query, setQuery] = useState('')
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [error, setError] = useState({})
  const [results, setResults] = useState([])
  const [resultsSelected, setResultsSelected] = useState(new Map());
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [selectedView, setSelectedView] = useState(false);
  const location = useLocation()

  const inputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    // this lets the user press backslash to jump focus to the search box
    const handleKeyPress = event => {
      if (event.keyCode === 220) { // backslash ("\") key 
        if (inputRef.current) {
          event.preventDefault()
          inputRef.current.select()
          window.scroll({ top: 40 })
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    setQuery(queryParams.get('q') || '')
    setCurrentPage(+queryParams.get('p') || 1)
  }, [location.search])

  useEffect(() => {
    // close selected view when loading new search
    setSelectedView(false);
    const fetchResults = async () => {
      setIsLoadingResults(true)
      try {
        // dug api
        const params = {
          index: 'concepts_index',
          query: query,
          offset: (currentPage - 1) * PER_PAGE,
          size: PER_PAGE,
        }
        const response = await axios.post(`${helxSearchUrl}/search`, params)
        if (response.status === 200 && response.data.status === 'success' && response?.data?.result?.hits) {
          const hits = response.data.result.hits.hits.map(r => r._source)
          setResults(hits)
          setTotalResults(response.data.result.total_items)
          setIsLoadingResults(false)
        } else {
          setResults([])
          setTotalResults(0)
        }
      } catch (error) {
        console.log(error)
        setError({ message: 'An error occurred!' })
        setIsLoadingResults(false)
      }
    }
    fetchResults()
  }, [query, currentPage, helxSearchUrl, setResults, setError])

  useEffect(() => {
    setPageCount(Math.ceil(totalResults / PER_PAGE))
  }, [totalResults])

  const fetchKnowledgeGraphs = async (tag_id) => {
    try {
      const { data } =  await axios.post(`${helxSearchUrl}/search_kg`, {
        index: 'kg_index',
        unique_id: tag_id,
        query: query,
        size: 100,
      })
      if (!data || data.result.total_items === 0) {
        return []
      }
      return data.result.hits.hits.map(graph => graph._source.knowledge_graph.knowledge_graph)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchStudyVariables = async (_id, _query) => {
    try {
      const { data } = await axios.post(`${helxSearchUrl}/search_var`, {
        concept: _id,
        index: 'variables_index',
        query: _query,
        size: 1000
      })
      if (!data?.result?.hits?.hits) {
        return []
      }
      return data.result.hits.hits.map(studyVar => studyVar._source);
      // return []
    } catch (error) {
      console.error(error)
    }
  }

  const doSearch = queryString => {
    const trimmedQuery = queryString.trim()
    if (trimmedQuery !== '') {
      setQuery(trimmedQuery)
      setCurrentPage(1)
      navigate(`/helx/search?q=${trimmedQuery}&p=1`)
    }
  }

  // This function will handle all checked items and store them in a state array,
  // along with update and remove each items. Each checkbox action will invoke this function
  const doSelect = newSelect => {
    let newSet = new Map(resultsSelected);
    if (!newSet.has(newSelect.id)) {
      newSet.set(newSelect.id, newSelect);
    }
    else {
      newSet.delete(newSelect.id)
    }
    setResultsSelected(newSet);
  }

  // clear all selected history

  const clearSelect = () => {
    setResultsSelected(new Map());
    setSelectedView(false);
  }

  const launchApp = () => {
    console.log(resultsSelected);
  }

  return (
    <HelxSearchContext.Provider value={{
      query, setQuery, doSearch, fetchKnowledgeGraphs, fetchStudyVariables, inputRef,
      error, isLoadingResults,
      results, totalResults,
      selectedView, setSelectedView, doSelect, resultsSelected, clearSelect,
      launchApp,
      currentPage, setCurrentPage, perPage: PER_PAGE, pageCount,
    }}>
      { children}
    </HelxSearchContext.Provider>
  )
}
