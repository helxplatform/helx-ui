import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from '@reach/router'
import { message } from 'antd'
import { useEnvironment, useAnalytics } from '../../contexts'
import { ConceptModal } from './'
import { useLocalStorage } from '../../hooks/use-local-storage'
import './search.css'

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
  const [conceptPages, setConceptPages] = useState({})
  // const [concepts, setConcepts] = useState([])
  const [variableError, setVariableError] = useState({})
  const [concepts, setConcepts] = useState([])
  const [totalConcepts, setTotalConcepts] = useState(0)
  const [studyResults, setStudyResults] = useState([])
  const [totalStudyResults, setStudyResultCount] = useState(0)
  const [variableStudyResults, setVariableStudyResults] = useState([])
  const [variableStudyResultCount, setVariableStudyResultCount] = useState(0)
  const [variableResults, setVariableResults] = useState([])
  const [isLoadingVariableResults, setIsLoadingVariableResults] = useState(false);
  const [variableError, setVariableError] = useState({})
  const [totalVariableResults, setVariableResultCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const location = useLocation()
  const [selectedResult, setSelectedResult] = useState(null)
  const [typeFilter, setTypeFilter] = useState(null)
  const [layout, _setLayout] = useLocalStorage("search_layout", SearchLayout.GRID)

  const inputRef = useRef()
  const navigate = useNavigate()

  const filteredConceptPages = useMemo(() => {
    if (typeFilter === null) return conceptPages
    return Object.fromEntries(Object.entries(conceptPages).map(([page, concepts]) => {
      return [
        page,
        concepts.filter((concept) => concept.type === typeFilter)
      ]
    }))
  }, [conceptPages, typeFilter])

  const conceptTypes = useMemo(() => Object.values(conceptPages).flat().reduce((acc, cur) => {
    if (!acc.includes(cur.type)) acc.push(cur.type)
    return acc
  }, []), [conceptPages])
  const conceptTypeCounts = useMemo(() => Object.values(conceptPages).flat().reduce((acc, cur) => {
    if (!acc.hasOwnProperty(cur.type)) acc[cur.type] = 0
    acc[cur.type] += 1
    return acc
  }, {}), [conceptPages])

  const concepts = useMemo(() => {
    if (!filteredConceptPages[currentPage]) return []
    else return filteredConceptPages[currentPage]
  }, [filteredConceptPages, currentPage])
  
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
    }
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
    setConceptPages({})
    setTypeFilter(null)
    setSelectedResult(null)
  }, [query])

  useEffect(() => {
    const trackSearch = (execTime, resultCount, error = undefined) => {
      analytics.trackEvent({
        category: "UI Interaction",
        action: "Search executed",
        label: `User searched for "${query}"`,
        value: execTime,
        customParameters: {
          "Execution time": execTime,
          "Search term": query,
          "Response count": resultCount,
          "Caused error": error !== undefined,
          "Error stack": error ? error.stack : undefined
        }
      });
    }
    const fetchConcepts = async () => {
      if (conceptPages[currentPage]) {
        return
      }
      console.log("Load page", query, currentPage)
      setIsLoadingConcepts(true)
      // await new Promise((resolve) => setTimeout(resolve, 2500))
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
            console.error(`The following ${hits.invalid.length} invalid concepts ` +
              `were removed from the ${hits.valid.length + hits.invalid.length} ` +
              `concepts in the response.`, hits.invalid)
          }
          const newConceptPages = { ...conceptPages }
          newConceptPages[currentPage] = hits.valid
          // setSelectedResult(null)
          setConceptPages(newConceptPages)
          setTotalConcepts(response.data.result.total_items)
          // setConcepts(hits.valid)
          setIsLoadingConcepts(false)
          analyticsEvents.searchExecuted(query, Date.now() - startTime, response.data.result.total_items)
        } else {
          const newConceptPages = { ...conceptPages }
          newConceptPages[currentPage] = []
          // setSelectedResult(null)
          setConceptPages(newConceptPages)
          // setConcepts([])
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
  }, [query, currentPage, conceptPages, helxSearchUrl, analyticsEvents])

  useEffect(() => {
    const fetchVariableResults = async () => {
      setIsLoadingVariableResults(true)
      try {
        const params = {
          index: 'variables_index',
          query: query,
          size: 10000
        }
        const response = await axios.post(`${helxSearchUrl}/search_var`, params)
        if (response.status === 200 && response.data.status === 'success' && response?.data?.result?.DbGaP) {
          const variables = new Set()
          const studies = response.data.result.DbGaP.map(r => r)
          studies.forEach(s => { s.elements.forEach(v => variables.add(v.id)) });
          setStudyResults(studies)
          setStudyResultCount(studies.length)
          setVariableResultCount(variables.size)
          setIsLoadingVariableResults(false)
        } else {
          setStudyResults([])
          setStudyResultCount(0)
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
      fetchVariableResults()
    }
  }, [query, currentPage, helxSearchUrl, setStudyResults, setVariableError])

  useEffect(() => {
    setPageCount(Math.ceil(totalConcepts / PER_PAGE))
  }, [totalConcepts])

  const fetchKnowledgeGraphs = useCallback(async (tag_id) => {
    try {
      const { data } = await axios.post(`${helxSearchUrl}/search_kg`, {
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
  }, [helxSearchUrl, query])

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
  }, [helxSearchUrl])

  const doSearch = queryString => {
    const trimmedQuery = queryString.trim()
    if (trimmedQuery !== '') {
      setQuery(trimmedQuery)
      setCurrentPage(1)
      navigate(`${basePath}search?q=${trimmedQuery}&p=1`)
    }
  }

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
    const fetchVariableResults = async () => {
      setIsLoadingVariableResults(true)
      try {
        const params = {
          index: 'variables_index',
          query: query,
          size: 10000
        }
        const response = await axios.post(`${helxSearchUrl}/search_var`, params)
        if (response.status === 200 && response.data.status === 'success' && response?.data?.result?.DbGaP) {
          
          // Data structure of studies matches API response 
          const studies = response.data.result.DbGaP.map(r => r)

          // Data structure of sortedVariables is designed to populate the histogram feature
          const {sortedVariables, variablesCount, studiesWithVariablesMarked, studiesCount} = collectVariablesAndUpdateStudies(studies)
          setVariableStudyResults(studiesWithVariablesMarked)
          setVariableStudyResultCount(studiesCount)

          setVariableResults(sortedVariables)
          setVariableResultCount(variablesCount)

          // Possible TODO.... I don't know for sure if this is used anywhere
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
      fetchVariableResults()
    }
  }, [query, helxSearchUrl])


  return (
    <HelxSearchContext.Provider value={{
      query, setQuery, doSearch, fetchKnowledgeGraphs, fetchStudyVariables, inputRef,
      error, isLoadingConcepts,
      concepts, totalConcepts, conceptPages: filteredConceptPages,
      variableError, variableResults, isLoadingVariableResults,
      concepts, totalConcepts,
      variableStudyResults, variableStudyResultCount,
      currentPage, setCurrentPage, perPage: PER_PAGE, pageCount,
      facets: tempSearchFacets,
      selectedResult, setSelectedResult,
      layout, setLayout, setFullscreenResult,
      typeFilter, setTypeFilter,
      conceptTypes, conceptTypeCounts
      variableError, isLoadingVariableResults,
      studyResults, totalStudyResults, totalVariableResults
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
