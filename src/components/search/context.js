import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from '@reach/router'
import { useEnvironment, useAnalytics } from '../../contexts'
import './search.css'
import { ConceptModal } from './'
import { useLocalStorage } from '../../hooks/use-local-storage'

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
// The search_var endpoint returns studies (DbGaP, etc) and CDEs.
// The CDEs will be rendered in another tab, so this array will assist
// in separating out CDEs from actual studies.
const STUDY_TYPES = ['DbGaP']


export const SearchLayout = Object.freeze({
  GRID: 'GRID',
  // LIST: 'LIST',
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
  const [selectedResult, _setSelectedResult] = useState(null)
  const [layout, _setLayout] = useLocalStorage("search_layout", SearchLayout.GRID)

  const inputRef = useRef()
  const navigate = useNavigate()
  
  /** Abort controllers */
  const searchSelectedResultController = useRef()

  // const selectedResultLoading = useMemo(() => selectedResult && selectedResult.loading === true, [selectedResult])
  // const selectedResultFailed = useMemo(() => selectedResult && selectedResult.failed === true, [selectedResult])
  
  /** Decorate `selectedResult` with fields:
   * - previousResult: the previous value of `selectedResult`
   * 
   */
  const setSelectedResult = useCallback((result) => _setSelectedResult((previousResult) => result === null ? null : ({
    ...result,
    previousResult: previousResult?.loading ? previousResult.previousResult : previousResult
  })), [_setSelectedResult])


  const validationReducer = (buckets, hit) => {
    const valid = validateResult(hit)
    if (valid) {
      return { valid: [...buckets.valid, hit], invalid: buckets.invalid }
    } else {
      return { valid: buckets.valid, invalid: [...buckets.invalid, hit] }
    }
  }

  const executeConceptSearch = async ({ query, offset, size }, axiosOptions) => {
    const params = {
      index: 'concepts_index',
      query,
      offset,
      size
    }
    const response = await axios.post(`${helxSearchUrl}/search`, params, axiosOptions)
    if (response.status === 200 && response.data.status === 'success' && response.data.result) {
      return response.data.result
    }
    return null
  }

  /** Async search for a concept by name/id and set the selected result */
  const searchSelectedResult = useCallback(async (name, id) => {
    const tempResult = {
      name,
      loading: true
    }
    setSelectedResult(tempResult)

    let foundConceptResult,
        synonymousConcepts,
        results
    
    
    if (searchSelectedResultController.current) searchSelectedResultController.current.abort()
    searchSelectedResultController.current = new AbortController()

    try {
      const dugResult = await executeConceptSearch({
        query: name,
        offset: 0,
        size: 200
      }, {
        signal: searchSelectedResultController.current.signal
      })
      if (dugResult && dugResult.hits) {
        const hits = dugResult.hits.hits.map(r => r._source).reduce(validationReducer, { valid: [], invalid: [] })
        results = hits.valid
        foundConceptResult = results.find((result) => (
          result.id === id ||
          result.name === name
          )
        )
        synonymousConcepts = results.filter((result) => result.identifiers.some((identifier) => identifier.equivalent_identifiers.includes(id)))
      }
      setSelectedResult(foundConceptResult ? foundConceptResult : {
        name,
        failed: true,
        suggestions: synonymousConcepts.length > 0 ? synonymousConcepts : results
      })
    } catch (e) {
      if (e.name !== "AbortError") throw e
    }
  }, [executeConceptSearch, validationReducer])

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

  useEffect(() => {
    const fetchConcepts = async () => {
      setIsLoadingConcepts(true)
      const startTime = Date.now()
      try {
        const result = await executeConceptSearch({
          query: query,
          offset: (currentPage - 1) * PER_PAGE,
          size: PER_PAGE
        })
        if (result && result.hits) {
          const unsortedHits = result.hits.hits.map(r => r._source)
          // gather invalid concepts: remove from rendered concepts and dump to console.
          let hits = unsortedHits.reduce(validationReducer, { valid: [], invalid: [] })
          if (hits.invalid.length) {
            console.error(`The following ${ hits.invalid.length } invalid concepts ` + 
              `were removed from the ${ hits.valid.length + hits.invalid.length } ` +
              `concepts in the response.`, hits.invalid)
          }
          setSelectedResult(null)
          setConcepts(hits.valid)
          setTotalConcepts(result.total_items)
          setIsLoadingConcepts(false)
          analyticsEvents.searchExecuted(query, Date.now() - startTime, result.total_items)
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

  const fetchKnowledgeGraphs = useCallback(async (tag_id, axiosOptions) => {
    try {
      const { data } =  await axios.post(`${helxSearchUrl}/search_kg`, {
        index: 'kg_index',
        unique_id: tag_id,
        query: query,
        size: 100,
      }, axiosOptions)
      if (!data || data.result.total_items === 0) {
        return []
      }
      return data.result.hits.hits.map(graph => graph._source.knowledge_graph)
    } catch (error) {
      console.error(error)
    }
  }, [helxSearchUrl, concepts])

  const fetchStudyVariables = useCallback(async (_id, _query, axiosOptions) => {
    try {
      const { data: { result } } = await axios.post(`${helxSearchUrl}/search_var`, {
        concept: _id,
        index: 'variables_index',
        query: _query,
        size: 1000
      }, axiosOptions)
      if (!result) {
        return []
      }
      const filteredAndTypedStudies = Object.keys(result)
        .reduce((studies, key) => {
          if (STUDY_TYPES.includes(key)) {
            const newStudies = [...result[key].map(item => ({ type: key, ...item }))]
            return [...newStudies, ...studies]        
          }
          return [...studies]
        }, [])
      return filteredAndTypedStudies
    } catch (error) {
      /** Forward AbortError upwards. Handle other errors here. */
      if (error.name === "AbortController") throw error
      else console.error(error)
    }
  }, [helxSearchUrl, concepts])

  const fetchCDEs = useCallback(async (_id, _query, axiosOptions) => {
    try {
      const { data: { result } } = await axios.post(`${helxSearchUrl}/search_var`, {
        concept: _id,
        index: 'variables_index',
        query: _query,
        size: 1000
      }, axiosOptions)
      if (!result) {
        return []
      }
      const cdesOnly = Object.keys(result)
        .reduce((studies, key) => {
          if (key === 'cde') {
            const newStudies = [...result[key].map(item => ({ type: key, ...item }))]
            return [...newStudies, ...studies]        
          }
          return [...studies]
        }, [])
      return cdesOnly[0]
    } catch (error) {
      /** Forward AbortError upwards. Handle other errors here. */
      if (error.name === "AbortController") throw error
      else console.error(error)
    }
  }, [helxSearchUrl, concepts])

  const doSearch = queryString => {
    const trimmedQuery = queryString.trim()
    if (trimmedQuery !== '') {
      setSelectedResult(null)
      setQuery(trimmedQuery)
      setCurrentPage(1)
      navigate(`${basePath}search?q=${trimmedQuery}&p=1`)
    }
  }

  return (
    <HelxSearchContext.Provider value={{
      query, setQuery, doSearch,
      fetchKnowledgeGraphs, fetchStudyVariables, fetchCDEs,
      inputRef,
      error, isLoadingConcepts,
      concepts, totalConcepts,
      currentPage, setCurrentPage, perPage: PER_PAGE, pageCount,
      facets: tempSearchFacets,
      selectedResult, setSelectedResult, searchSelectedResult,
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
