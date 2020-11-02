import React, { Fragment, useMemo } from 'react'
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

export const SearchResults = () => {
  const theme = useTheme()
  const auth = useAuth()
  const { query, results, totalResults, perPage, currentPage, pageCount, isLoadingResults, error } = useHelxSearch()

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
                  <div>Results { (currentPage - 1) * perPage + 1 } to { (currentPage - 1) * perPage + results.length } of { totalResults } total results</div>
                  <div>
                    { MemoizedActions }
                  </div>
                </Meta>
              )
            }
            {
              results.map((result, i) => {
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
