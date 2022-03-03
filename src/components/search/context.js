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

//

const validateResult = result => {
  return result.description.trim() && result.name.trim()
}

export const HelxSearch = ({ children }) => {
  const { helxSearchUrl, basePath } = useEnvironment()
  const analytics = useAnalytics()
  const [query, setQuery] = useState('')
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [error, setError] = useState({})
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

  const validationReducer = (buckets, hit) => {
    const valid = validateResult(hit)
    if (valid) {
      return { valid: [...buckets.valid, hit], invalid: buckets.invalid }
    } else {
      return { valid: buckets.valid, invalid: [...buckets.invalid, hit] }
    }
  }

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
            console.error(`The following ${hits.invalid.length} invalid concepts ` +
              `were removed from the ${hits.valid.length + hits.invalid.length} ` +
              `concepts in the response.`, hits.invalid)
          }
          setConcepts(hits.valid)
          setTotalConcepts(response.data.result.total_items)
          setIsLoadingConcepts(false)
          trackSearch(Date.now() - startTime, response.data.result.total_items)
        } else {
          setConcepts([])
          setTotalConcepts(0)
          setIsLoadingConcepts(false)
          trackSearch(Date.now() - startTime, 0)
        }
      } catch (error) {
        console.log(error)
        setError({ message: 'An error occurred!' })
        setIsLoadingConcepts(false)
        trackSearch(Date.now() - startTime, 0, error)
      }
    }
    if (query) {
      fetchConcepts()
    }
  }, [query, currentPage, helxSearchUrl, setConcepts, setError])

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

  function collectVariablesAndUpdateStudies(studies) {
    const variables = []
    const studiesWithVariablesMarked = []

    studies.forEach((study, indexByStudy) => {
      const studyToUpdate = Object.assign({}, study);
      studyToUpdate["elements"] = [];

      study.elements.forEach((variable, indexByVariable) => {
        const variableIndex = parseFloat(`${indexByStudy}.${indexByVariable}`)
        
        const variableToUpdate = Object.assign({}, variable);
        variableToUpdate["indexWithinStudy"] = variableIndex
        variableToUpdate["study_name"] = study.c_name
        variables.push(variableToUpdate)
        
        studyToUpdate["elements"].push(variableToUpdate)
      })

      studiesWithVariablesMarked.push(studyToUpdate)
    });

    const sortedVariables = variables.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    const sortedVariablesWithIndexPosition = sortedVariables.map((v, i) =>  {
      const rObj = v
      rObj["index_pos"] = i
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
          // console.log("studiesWithVariablesMarked")
          // console.log(studiesWithVariablesMarked)
          // console.log("sortedVariables")
          // console.log(sortedVariables)
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
      variableError, variableResults, isLoadingVariableResults,
      concepts, totalConcepts,
      variableStudyResults, variableStudyResultCount,
      currentPage, setCurrentPage, perPage: PER_PAGE, pageCount,
      facets: tempSearchFacets,
      selectedResult, setSelectedResult,
      studyResults, totalStudyResults, totalVariableResults
    }}>
      {children}
      <ConceptModal
        result={selectedResult}
        visible={selectedResult !== null}
        closeHandler={() => setSelectedResult(null)}
      />
    </HelxSearchContext.Provider>
  )
}
