import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from '@gatsbyjs/reach-router'
import { useEnvironment, useAnalytics } from '../../contexts'
import { ConceptModal } from './'
import { useLocalStorage } from '../../hooks'
import './search.css'

export const HelxSearchContext = createContext({})
export const useHelxSearch = () => useContext(HelxSearchContext)

const PER_PAGE = 20

export const SearchLayout = Object.freeze({
  GRID: 'GRID',
  // LIST: 'LIST',
  EXPANDED_RESULT: 'EXPANDED_RESULT',
  VARIABLE_VIEW: 'VARIABLE_VIEW'
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
  const [conceptPages, setConceptPages] = useState({})
  const [conceptTypes, setConceptTypes] = useState({})
  // const [concepts, setConcepts] = useState([])
  const [totalConcepts, setTotalConcepts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const location = useLocation()
  const [selectedResult, _setSelectedResult] = useState(null)
  // const [selectedResult, setSelectedResult] = useState(null)
  const [typeFilter, setTypeFilter] = useState(null)
  const [layout, _setLayout] = useLocalStorage("search_layout", SearchLayout.GRID)

  // The following serve the Variable Results view
  const [variableStudyResults, setVariableStudyResults] = useState([])
  const [variableStudyResultCount, setVariableStudyResultCount] = useState(0)
  const [variableResults, setVariableResults] = useState([])
  const [totalVariableResults, setVariableResultCount] = useState(0)
  const [isLoadingVariableResults, setIsLoadingVariableResults] = useState(false);
  const [variableError, setVariableError] = useState({})

  const inputRef = useRef()
  const navigate = useNavigate()
  const [searchHistory, setSearchHistory] = useLocalStorage('search_history', [])
  
  /** Abort controllers */
  const fetchConceptsController = useRef()
  const searchSelectedResultController = useRef()

  // const selectedResultLoading = useMemo(() => selectedResult && selectedResult.loading === true, [selectedResult])
  // const selectedResultFailed = useMemo(() => selectedResult && selectedResult.failed === true, [selectedResult])
  
  /** Decorate `selectedResult` with fields:
   * - previousResult: the last value of `selectedResult`
   * 
   */
  const setSelectedResult = useCallback((result) => {
    // Make sure to cancel searchSelectedResult requests so that calls to it don't override state with stale data.
    searchSelectedResultController.current?.abort()
    _setSelectedResult((previousResult) => {
      let newPreviousResult = previousResult
      // The prev result has a prev result
      if (previousResult?.loading) {
        newPreviousResult = previousResult.previousResult
      }
      else if (result === previousResult?.previousResult) {
        // Prevent circular loopbacks (i.e. prev -> current -> prev)
        newPreviousResult = result?.previousResult
      }
      return result === null ? null : ({
        ...result,
        previousResult: newPreviousResult
      })
    })
  }, [_setSelectedResult])

  const validationReducer = (buckets, hit) => {
    const valid = validateResult(hit)
    if (valid) {
      return { valid: [...buckets.valid, hit], invalid: buckets.invalid }
    } else {
      return { valid: buckets.valid, invalid: [...buckets.invalid, hit] }
    }
  }

  const executeConceptSearch = async ({ query, types, offset, size }, axiosOptions) => {
    const params = {
      index: 'concepts_index',
      query,
      types,
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
      if (e.name !== "CanceledError") throw e
    }
  }, [executeConceptSearch, validationReducer])

  const concepts = useMemo(() => {
    if (!conceptPages[currentPage]) return []
    else return conceptPages[currentPage]
  }, [conceptPages, currentPage])
  
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
      if (inputRef.current) {
        const inputFocus = inputRef.current.input === document.activeElement
        if (!inputFocus) {
          if (event.key === "\\" || event.key === "/") {
            event.preventDefault()
            inputRef.current.focus()
            // inputRef.current.select()
            window.scroll({ top: 40 })
          } else {
            // Keypress with no associated function has been fired on the page.
            // message.open({
            //   content: `use "/" to focus the search box.`
            // })
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const q = queryParams.get('q') || ''
    setQuery(q)
    setCurrentPage(+queryParams.get('p') || 1)
    if (q === '') {
      setTotalConcepts(0)
      setVariableStudyResultCount(0)
      setVariableResultCount(0)
    }
  }, [location.search])

  useEffect(() => {
    setConceptPages({})
    setConceptTypes({})
    setError({})
    setTypeFilter(null)
    setSelectedResult(null)
    setVariableStudyResults([])
    setVariableResults([])
  }, [query])

  useEffect(() => {
    setConceptPages({})
    setCurrentPage(1)
    setError({})
  }, [typeFilter])
  useEffect(() => {
    const fetchConcepts = async () => {
      if (conceptPages[currentPage]) {
        return
      }

      fetchConceptsController.current?.abort()
      fetchConceptsController.current = new AbortController()

      setIsLoadingConcepts(true)
      const startTime = Date.now()
      try {
        const result = await executeConceptSearch({
          query: query,
          types: typeFilter ? [typeFilter] : undefined,
          offset: (currentPage - 1) * PER_PAGE,
          size: PER_PAGE
        }, {
          signal: fetchConceptsController.current.signal
        })
        if (result && result.hits) {
          const unsortedHits = result.hits.hits.map(r => ({
            ...r._source,
            explanation: r._explanation
          }))
          // gather invalid concepts: remove from rendered concepts and dump to console.
          let hits = unsortedHits.reduce(validationReducer, { valid: [], invalid: [] })
          if (hits.invalid.length) {
            console.error(`The following ${hits.invalid.length} invalid concepts ` +
              `were removed from the ${hits.valid.length + hits.invalid.length} ` +
              `concepts in the response.`, hits.invalid)
          }
          const newConceptPages = { ...conceptPages }
          newConceptPages[currentPage] = hits.valid
          // setSelectedResult(null)
          setConceptPages(newConceptPages)
          setConceptTypes(result.concept_types)
          setTotalConcepts(result.total_items)
          // setConcepts(hits.valid)
          setIsLoadingConcepts(false)
          // analyticsEvents.searchExecuted(query, Date.now() - startTime, result.total_items)
        } else {
          const newConceptPages = { ...conceptPages }
          newConceptPages[currentPage] = []
          setConceptPages(newConceptPages)
          setConceptTypes({})
          setTotalConcepts(0)
          setIsLoadingConcepts(false)
          // analyticsEvents.searchExecuted(query, Date.now() - startTime, 0)
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.log(error)
          setError({ message: 'An error occurred!' })
          setTotalConcepts(0)
          setIsLoadingConcepts(false)
          // analyticsEvents.searchExecuted(query, Date.now() - startTime, 0, error)
        }
      }
    }
    if (query) {
      fetchConcepts()
    }
  }, [query, currentPage, conceptPages, typeFilter, helxSearchUrl, analyticsEvents])

  useEffect(() => {
    setPageCount(Math.ceil(totalConcepts / PER_PAGE))
  }, [totalConcepts])

  const fetchKnowledgeGraphs = useCallback(async (tag_id, axiosOptions) => {
    try {
      const { data } = await axios.post(`${helxSearchUrl}/search_kg`, {
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
      /** Forward AbortError upwards. Handle other errors here. */
      if (error.name === "CanceledError") throw error
      else console.error(error)
    }
  }, [helxSearchUrl, query])

  const fetchVariablesForConceptId = useCallback(async (_id, _query, axiosOptions) => {
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
          if (key !== "cde") {
            const newStudies = [...result[key].map(item => ({ type: key, ...item }))]
            return [...newStudies, ...studies]        
          }
          return [...studies]
        }, [])
      return filteredAndTypedStudies
    } catch (error) {
      /** Forward AbortError upwards. Handle other errors here. */
      if (error.name === "CanceledError") throw error
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
        return null
      }
      const cdesOnly = Object.keys(result)
        .reduce((studies, key) => {
          if (key === 'cde') {
            const newStudies = [...result[key].map(item => ({ type: key, ...item }))]
            return [...newStudies, ...studies]        
          }
          return [...studies]
        }, [])
      return cdesOnly ? cdesOnly[0] : null
    } catch (error) {
      /** Forward AbortError upwards. Handle other errors here. */
      if (error.name === "CanceledError") throw error
      else console.error(error)
    }
  }, [helxSearchUrl])

  const doSearch = useCallback((queryString) => {
    const trimmedQuery = queryString.trim()
    if (trimmedQuery !== '') {
      setSelectedResult(null)
      setQuery(trimmedQuery)
      setCurrentPage(1)
      navigate(`${basePath}search?q=${trimmedQuery}&p=1`)
      setSearchHistory((searchHistory) => {
        const existingHistoryEntry = searchHistory.find((searchHistoryEntry) => searchHistoryEntry.search === trimmedQuery)
        // Update existing entry to current time.
        if (existingHistoryEntry) return [
          ...searchHistory.filter((entry) => entry !== existingHistoryEntry),
          {
            ...existingHistoryEntry,
            time: Date.now()
          }
        ]
        // Add new search history entry
        else return [...searchHistory, {
          search: trimmedQuery,
          time: Date.now()
        }]
      })
    }
  }, [setSelectedResult, navigate, basePath, setSearchHistory])

  useEffect(() => {
    return () => {
      // Unmount
      searchSelectedResultController.current?.abort()
    }
  }, [])

  function collectVariablesAndUpdateStudies(studies) {
    const variables = []
    const studiesWithVariablesMarked = []

    studies.forEach((study, indexByStudy) => {
      const studyToUpdate = Object.assign({}, study);
      studyToUpdate["elements"] = [];

      study.elements.forEach((variable, indexByVariable) => {
        const variableToUpdate = Object.assign({}, variable);
        variableToUpdate["study_name"] = study.c_name
        variableToUpdate["withinFilter"] = "none"
        variables.push(variableToUpdate)
        
        studyToUpdate["elements"].push(variableToUpdate)
      })

      studiesWithVariablesMarked.push(studyToUpdate)
    });

    const sortedVariables = variables.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    const sortedVariablesWithIndexPosition = sortedVariables.map((v, i) =>  {
      const rObj = v
      rObj["indexPos"] = i
      return rObj;
    })

    return {
      "sortedVariables": sortedVariablesWithIndexPosition,
      "variablesCount": sortedVariables.length,
      "studiesWithVariablesMarked": studiesWithVariablesMarked,
      "studiesCount": studiesWithVariablesMarked.length
    };
  }

  useEffect(() => {
    const fetchAllVariables = async () => {
      setIsLoadingVariableResults(true)
      try {
        const params = {
          index: 'variables_index',
          query: query,
          size: 10000
        }
        const response = await axios.post(`${helxSearchUrl}/search_var`, params)
        if (response.status === 200 && response.data.status === 'success' && response?.data?.result && Object.keys(response?.data?.result).length > 0) {
          
          // Data structure of studies matches API response 
          const studies = Object.entries(response.data.result).reduce((acc, [studySource, studies]) => {
            studies.forEach((study) => {
              study.data_source = studySource
              study.elements.forEach((variable) => {
                variable.data_source = studySource
              })
            })
            return [...acc, ...studies]
          }, [])

          // Data structure of sortedVariables is designed to populate the histogram feature
          const {sortedVariables, variablesCount, studiesWithVariablesMarked, studiesCount} = collectVariablesAndUpdateStudies(studies)
          setVariableStudyResults(studiesWithVariablesMarked)
          setVariableStudyResultCount(studiesCount)

          setVariableResults(sortedVariables)
          setVariableResultCount(variablesCount)

          setIsLoadingVariableResults(false)
        } else {
          setVariableStudyResults([])
          setVariableStudyResultCount(0)
          setVariableResults([])
          setVariableResultCount(0)
          setIsLoadingVariableResults(false)
        }
      } catch (variableError) {
        console.log(variableError)
        setVariableError({ message: 'An variable error occurred!' })
        setIsLoadingVariableResults(false)
      }
    }

    if (query) {
      fetchAllVariables()
    }
  }, [query, helxSearchUrl])


  return (
    <HelxSearchContext.Provider value={{
      query, setQuery, doSearch, fetchKnowledgeGraphs, fetchVariablesForConceptId, inputRef,
      query, setQuery, doSearch,
      fetchKnowledgeGraphs, fetchCDEs, fetchVariablesForConceptId,
      inputRef,
      error, isLoadingConcepts,
      concepts, totalConcepts, conceptPages,
      currentPage, setCurrentPage, perPage: PER_PAGE, pageCount,
      selectedResult, setSelectedResult, searchSelectedResult,
      layout, setLayout, setFullscreenResult,
      typeFilter, setTypeFilter,
      searchHistory, setSearchHistory,
      conceptTypes,
      variableStudyResults, variableStudyResultCount,
      variableError, variableResults, isLoadingVariableResults,
      totalVariableResults
    }}>
      {children}
      <ConceptModal
        result={ selectedResult }
        visible={ layout !== SearchLayout.EXPANDED_RESULT && selectedResult !== null }
        closeHandler={ () => setSelectedResult(null) }
      />
    </HelxSearchContext.Provider>
  )
}
