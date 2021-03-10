import React, { Fragment, useEffect, useState, useMemo } from 'react'
import styled, { css, useTheme } from 'styled-components'
import { useHelxSearch } from './search-context'
import { useAuth } from '../../contexts'
import { Paragraph } from '../typography'
import { LoadingSpinner } from '../loading-spinner'
import { Result } from './search-result'
import { PaginationTray } from './search-pagination-tray'
import { Link } from '../link'
import { Icon } from '../icon'
import { IconButton } from '../button'
import { Tooltip } from '../tooltip'

const Wrapper = styled.div``

const Meta = styled.div(({ theme, underline, overline }) => css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-width: 0;
  border-top-width: ${ overline ? '1px' : 0 };
  border-bottom-width: ${ underline ? '1px' : 0 };
  border-style: solid;
  border-color: ${ theme.color.grey.light };
  margin: ${ theme.spacing.xl } 0;
  @media (min-width: 600px) {
    justify-content: space-between;
    flex-direction: row;
  }
  animation: ${ theme.animation.fadeIn };
`)

const SelectedBar = styled.div(({ theme }) => css`
  display: flex;
  justify-content: center;
  color: ${theme.color.success};
  background-color: white;
  cursor: pointer;
  &:hover ${SelectedDropdown}{
    visibility: visible;
    opacity: 1;
  }
`)

const SelectedText = styled.div(({ theme }) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
`)

const SelectedDropdown = styled.div(({ theme }) => css`
  visibility: hidden;
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  position: absolute;
  border-radius: 5px;
  padding: 20px 10px;
  background-color: ${theme.color.grey.light};
  z-index: 1;
  color: ${theme.color.primary.dark};
  & :hover {
    filter: brightness(0.9);
  }
  transition: opacity 500ms;
  -webkit-transition: opacity 500ms;
`)

const SelectedDropdownCheckbox = styled.input`
  margin-right: 2px;
`

const SelectedDropdownButton = styled.button(({ theme }) => css`
  background-color: ${theme.color.primary.dark};
  color: white;
  border: 0;
  border-radius: ${theme.border.radius};
  margin: ${theme.spacing.small};
  padding: ${theme.spacing.small};
`)

export const SearchResults = () => {
  const theme = useTheme()
  const auth = useAuth()
  const [currentResults, setCurrentResults] = useState([]);
  const { query, results, totalResults, perPage, currentPage, pageCount, isLoadingResults, resultsSelected, clearSelect, error, selectedView, setSelectedView } = useHelxSearch()

  // handle selected view and update search results when needed

  useEffect(() => {
    if(selectedView){
      setCurrentResults(Array.from(resultsSelected.values()));
    }
    else{
      setCurrentResults(results);
    }
  },[results, selectedView])

  const MemoizedResultsSummary = useMemo(() => {
    if (!results) return null
    return (
      <Paragraph align="center">
        { totalResults } results for "{ query }" ({ pageCount } page{ pageCount > 1 && 's' })
      </Paragraph>
    )
  }, [query, pageCount, results, totalResults])

  const MemoizedActions = useMemo(() => (
    <Fragment>
      <Tooltip tip="Shareable link" placement="top">
        <Link to={ `/search?q=${ query }&p=${ currentPage }` } style={{ display: 'inline-flex', alignItems: 'center', color: theme.color.primary.dark }}>
          <Icon icon="link" fill={ theme.color.primary.dark } size={ 24 } style={{ padding: '0 4px 0 0' }} />
        </Link>
      </Tooltip>
      {
        auth.user && (
          <Tooltip tip="Save results" placement="top"> 
            <IconButton variant="transparent"
              onClick={ auth.saveSearch(query, currentPage) }
              icon="star" size={ 24 }
              fill={ auth.user.search.favorites.includes(JSON.stringify({ query, page: currentPage })) ? theme.color.extended.gold : theme.color.grey.light  }
            />
          </Tooltip>
          )
      }
    </Fragment>
  ), [query, currentPage, auth, theme.color.primary.dark])

  return (
    <Wrapper>

      { MemoizedResultsSummary }

      <PaginationTray />

      <br/>

      { isLoadingResults && <LoadingSpinner style={{ margin: theme.spacing.extraLarge }} /> }

      { !isLoadingResults && error && <span>{ error.message }</span> }

      {
        query && !isLoadingResults && !error.message && (
          <Fragment>
            {
              results.length >= 1 && (
                <Meta underline>
                  <div>
                    Results { (currentPage - 1) * perPage + 1 } to { (currentPage - 1) * perPage + results.length } of { totalResults } total results
                    &nbsp;&nbsp;&nbsp;&nbsp;
                  </div>
                  {
                      resultsSelected.size > 0 && (
                        <SelectedBar>
                          <SelectedText>{resultsSelected.size} result{resultsSelected.size !== 1 ? `s` : `` } selected <Icon icon="chevronDown" fill={theme.color.grey.main}/></SelectedText>
                          <SelectedDropdown><div onClick={() => setSelectedView(!selectedView)}><SelectedDropdownCheckbox checked={selectedView} type="checkbox"/>Show Selected Only</div><div><SelectedDropdownButton onClick={clearSelect}>Clear</SelectedDropdownButton><SelectedDropdownButton onClick={clearSelect}>Launch App</SelectedDropdownButton></div></SelectedDropdown>
                        </SelectedBar>
                      )
                    }
                  <div>
                    { MemoizedActions }
                  </div>
                </Meta>
              )
            }
            {
              currentResults.map((result, i) => {
                const index = (currentPage - 1) * perPage + i + 1
                return <Result key={ `result-${ index }` } index={ index } result={ result } />
              })
            }
            {
              results.length >= 1 && (
                <Meta overline>
                  <div>Results { (currentPage - 1) * perPage + 1 } to { (currentPage - 1) * perPage + results.length } of { totalResults } total results</div>
                  <div>{ MemoizedActions }</div>
                </Meta>
              )
            }
          </Fragment>
        )
      }

      <br/><br/>

      <PaginationTray />

      <br/><br/>

    </Wrapper>
  )
}
