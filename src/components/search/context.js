import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
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

//

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
  // const [selectedResult, _setSelectedResult] = useState(null)
  const [resultCrumbs, setResultBreadcrumbs] = useState([])

  const inputRef = useRef()
  const navigate = useNavigate()

  const selectedResult = useMemo(() => resultCrumbs[resultCrumbs.length - 1], [resultCrumbs])
  const selectedResultLoading = useMemo(() => selectedResult && selectedResult.loading === true, [selectedResult])
  const selectedResultFailed = useMemo(() => selectedResult && selectedResult.failed === true, [selectedResult])

  const executeDugSearch = async ({ query, offset, size }) => {
    const params = {
      index: 'concepts_index',
      query,
      offset,
      size
    }
    const response = await axios.post(`${helxSearchUrl}/search`, params)
    if (response.status === 200 && response.data.status === 'success' && response.data.result) {
      return response.data.result
    }
    return null
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
        const result = await executeDugSearch({
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
          setConcepts(hits.valid)
          setTotalConcepts(result.total_items)
          setIsLoadingConcepts(false)
          analyticsEvents.searchExecuted(query, Date.now() - startTime, result.total_items)
        } else {
          setConcepts([])
          setTotalConcepts(0)
          setIsLoadingConcepts(false)
          analyticsEvents.searchExecuted(query, Date.now() - startTime, 0)
        }
      } catch (error) {
        console.error(error)
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

  const setSelectedResult = (result) => {
    if (result === null) setResultBreadcrumbs([])
    else setResultBreadcrumbs([ result ])
  }

  const addResultBreadcrumb = (result) => {
    setResultBreadcrumbs([ ...resultCrumbs, result ])
  }

  const goToResultBreadcrumb = (result) => {
    const resultIndex = resultCrumbs.indexOf(result)
    if (resultIndex !== -1) setResultBreadcrumbs(resultCrumbs.slice(0, resultIndex + 1))
    else console.error("Could not find breadcrumb for result:", result)
  }

  const addBreadcrumbFromKG = async ({ name, id }) => {
    const tempResult = {
      name,
      loading: true
    }
    addResultBreadcrumb(tempResult)
    // You currently can't restrict a query against the Dug concepts index to certain concept ids.
    const dugResult = await executeDugSearch({
      query: name,
      offset: 0,
      size: 200
    })
    let foundConceptResult;
    let synonymousConcepts;
    let results;
    if (dugResult && dugResult.hits) {
      const hits = dugResult.hits.hits.map(r => r._source).reduce(validationReducer, { valid: [], invalid: [] })
      results = hits.valid
      // console.log(id, name, results)
      foundConceptResult = results.find((result) => (
        result.id === id ||
        result.name === name
        // result.identifiers.some((identifier) => identifier.equivalent_identifiers.includes(id))
        )
      )
      synonymousConcepts = results.filter((result) => result.identifiers.some((identifier) => identifier.equivalent_identifiers.includes(id)))
      console.log(id, synonymousConcepts.map((result) => result.name))
      console.log(results);
    }
    setResultBreadcrumbs((prevResultCrumbs) => {
      const index = prevResultCrumbs.indexOf(tempResult)
      // The crumb no longer exists (e.g. user went to older crumb/closed modal/etc.)
      if (index === -1) return prevResultCrumbs
      return [
        ...prevResultCrumbs.slice(0, index),
        foundConceptResult ? foundConceptResult : {
          name,
          failed: true,
          suggestions: synonymousConcepts.length > 0 ? synonymousConcepts : results
        }
      ]
    })
  }

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
      selectedResult, setSelectedResult, selectedResultLoading, selectedResultFailed,
      resultCrumbs, addResultBreadcrumb, goToResultBreadcrumb, addBreadcrumbFromKG
    }}>
      { children }
      <ConceptModal
        result={ selectedResult }
        visible={ selectedResult !== null}
        closeHandler={ () => setSelectedResult(null) }
      />
    </HelxSearchContext.Provider>
  )
}
