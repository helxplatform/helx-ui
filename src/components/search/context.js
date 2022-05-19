import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from '@reach/router'
import { useEnvironment, useAnalytics } from '../../contexts'
import './search.css'
import { ConceptModal } from './'

//

export const HelxSearchContext = createContext({})
export const useHelxSearch = () => useContext(HelxSearchContext)

//

const PER_PAGE = 20
const tempSearchFacets = [
  'ALL',
  'Biolink',
  'CDE',
  'Harmonized',
  'LOINC',
  'PhenX',
].sort((f, g) => f.toLowerCase() < g.toLowerCase() ? -1 : 1)


export const SearchLayout = Object.freeze({
  GRID: 'GRID',
  LIST: 'LIST',
  EXPANDED_RESULT: 'EXPANDED_RESULT',
})

const validateResult = result => {
  return result.description.trim() && result.name.trim()
}

export const HelxSearch = ({ children }) => {
  const { helxSearchUrl, basePath } = useEnvironment()
  const { analyticsEvents } = useAnalytics()
  const [query, setQuery] = useState('')
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [error, setError] = useState({})
  const [concepts, setConcepts] = useState([])
  const [totalConcepts, setTotalConcepts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const location = useLocation()
  const [selectedResult, setSelectedResult] = useState(null)
  const [layout, _setLayout] = useState(SearchLayout.GRID)

  const inputRef = useRef()
  const navigate = useNavigate()

  const setLayout = (newLayout) => {
    // Only track when layout changes
    if (layout !== newLayout) {
      analyticsEvents.searchLayoutChanged(query, newLayout, layout)
    }
    if (newLayout !== SearchLayout.EXPANDED_RESULT) {
      setSelectedResult(null)
    }
    _setLayout(newLayout)
  }

  const setFullscreenResult = (result) => {
    // setSelectedResult(null)
    setLayout(SearchLayout.EXPANDED_RESULT)
    setSelectedResult(result)
  }

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

  const validationReducer = (buckets, hit) => {
    const valid = validateResult(hit)
    if (valid) {
      return { valid: [...buckets.valid, hit], invalid: buckets.invalid }
    } else {
      return { valid: buckets.valid, invalid: [...buckets.invalid, hit] }
    }
  }

  useEffect(() => {
    const fetchConcepts = async () => {
      setIsLoadingConcepts(true)
      const startTime = Date.now()
      try {
        const params = {
          index: 'concepts_index',
          query: query,
          offset: (currentPage - 1) * PER_PAGE,
          size: PER_PAGE,
        }
        const response = await axios.post(`${helxSearchUrl}/search`, params)
        if (response.status === 200 && response.data.status === 'success' && response?.data?.result?.hits) {
          const unsortedHits = response.data.result.hits.hits.map(r => r._source)
          // gather invalid concepts: remove from rendered concepts and dump to console.
          let hits = unsortedHits.reduce(validationReducer, { valid: [], invalid: [] })
          if (hits.invalid.length) {
            console.error(`The following ${ hits.invalid.length } invalid concepts ` + 
              `were removed from the ${ hits.valid.length + hits.invalid.length } ` +
              `concepts in the response.`, hits.invalid)
          }
          setSelectedResult(null)
          setConcepts(hits.valid)
          setTotalConcepts(response.data.result.total_items)
          setIsLoadingConcepts(false)
          analyticsEvents.searchExecuted(query, Date.now() - startTime, response.data.result.total_items)
        } else {
          setSelectedResult(null)
          setConcepts([])
          setTotalConcepts(0)
          setIsLoadingConcepts(false)
          analyticsEvents.searchExecuted(query, Date.now() - startTime, 0)
        }
      } catch (error) {
        console.log(error)
        setError({ message: 'An error occurred!' })
        setIsLoadingConcepts(false)
        analyticsEvents.searchExecuted(query, Date.now() - startTime, 0, error)
      }
    }
    if (query) {
      fetchConcepts()
    }
  }, [query, currentPage, helxSearchUrl, setConcepts, setError])

  useEffect(() => {
    setPageCount(Math.ceil(totalConcepts / PER_PAGE))
  }, [totalConcepts])

  const fetchKnowledgeGraphs = useCallback(async (tag_id) => {
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
      return data.result.hits.hits.map(graph => graph._source.knowledge_graph)
    } catch (error) {
      console.error(error)
    }
  }, [helxSearchUrl, concepts])

  const fetchStudyVariables = useCallback(async (_id, _query) => {
    try {
      const { data } = await axios.post(`${helxSearchUrl}/search_var`, {
        concept: _id,
        index: 'variables_index',
        query: _query,
        size: 1000
      })
      if (!data) {
        return []
      }
      return data
      // return []
    } catch (error) {
      console.error(error)
    }
  }, [helxSearchUrl, concepts])

  const doSearch = queryString => {
    const trimmedQuery = queryString.trim()
    if (trimmedQuery !== '') {
      setQuery(trimmedQuery)
      setCurrentPage(1)
      navigate(`${basePath}search?q=${trimmedQuery}&p=1`)
    }
  }

  return (
    <HelxSearchContext.Provider value={{
      query, setQuery, doSearch, fetchKnowledgeGraphs, fetchStudyVariables, inputRef,
      error, isLoadingConcepts,
      concepts, totalConcepts,
      currentPage, setCurrentPage, perPage: PER_PAGE, pageCount,
      facets: tempSearchFacets,
      selectedResult, setSelectedResult,
      layout, setLayout, setFullscreenResult
    }}>
      { children }
      <ConceptModal
        result={ selectedResult }
        visible={ layout !== SearchLayout.EXPANDED_RESULT && selectedResult !== null }
        closeHandler={ () => setSelectedResult(null) }
      />
    </HelxSearchContext.Provider>
  )
}
