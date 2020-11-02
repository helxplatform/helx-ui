import React, { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { useHelxSearch } from './search-context'
import { Icon } from '../icon'
import { Link } from '../link'

const Wrapper = styled.nav(({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  & a {
    color: ${ theme.color.primary.dark };
    background-color: ${ theme.color.grey.light };
    text-decoration: none;
    margin: 0 ${ theme.spacing.extraSmall };
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${ theme.spacing.extraSmall } ${ theme.spacing.small };
    filter: brightness(1.1);
    border-radius: ${ theme.border.radius };
    transition: filter 250ms, background-color 250ms;
  }
  & a:hover {
    filter: brightness(1.0);
  }
  & a[aria-current="true"] {
    pointer-events: none;
    background-color: ${ theme.color.primary.dark };
    color: ${ theme.color.grey.light };
  }
  & svg {
    pointer-events: none;
    min-width: 1.5rem;
    min-height: 1.5rem;
  }
`)

const PaginationLink = ({ icon, disabled, children, ...props }) => {
  const theme = useTheme()
  // icon
  if (icon) {
    return (
      <Link { ...props } style={{ pointerEvents: disabled ? 'none' : 'auto' }}>
        <Icon icon={ icon } size={ 16 } fill={ disabled ? theme.color.grey.main : theme.color.primary.dark } />
      </Link>
    )
  }
  // just text
  return <Link { ...props }>{ children }</Link>
}

export const PaginationTray = () => {
  const { query, totalResults, currentPage, perPage } = useHelxSearch()
  const [pageCount, setPageCount] = useState(0)

  useEffect(() => {
    setPageCount(Math.ceil(totalResults / perPage))
  }, [totalResults, perPage])

  if (totalResults === 0) return null

  return (
    <Wrapper role="navigation" aria-label="Pagination Navigation">
      <PaginationLink to={ `/search?q=${ query }&p=1` } icon="firstPage" disabled={ currentPage <= 1 } aria-label="Go to first page" />
      <PaginationLink to={ `/search?q=${ query }&p=${ currentPage - 1 }` } icon="chevronLeft" disabled={ currentPage <= 1 } aria-label="Go to previous page"/>
      {
        [...Array(pageCount).keys()].map(i => (
            <PaginationLink
              key={ `link-to-p${ i + 1 }` }
              to={ `/search?q=${ query }&p=${ i + 1 }` }
              disabled={ currentPage === i + 1 }
              aria-label={ currentPage === i + 1 ? `Current page, page ${ i + 1 }` : `Go to page ${ i + 1 }` }
              aria-current={ currentPage === i + 1 }
            >
              { i + 1 }
            </PaginationLink>
          )
        )
      }
      <PaginationLink to={ `/search?q=${ query }&p=${ currentPage + 1 }` } icon="chevronRight" disabled={ currentPage >= pageCount } aria-label="Go to next page"/>
      <PaginationLink to={ `/search?q=${ query }&p=${ pageCount }` } icon="lastPage" disabled={ currentPage >= pageCount } aria-label="Go to last page"/>
    </Wrapper>
  )
}

PaginationTray.propTypes = {}
