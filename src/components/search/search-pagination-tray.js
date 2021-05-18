import React, { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { useHelxSearch } from './search-context'
import { Icon } from '../icon'
import { Link } from '../link'

const Wrapper = styled.nav(({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
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
    height: 2rem;
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
  const { query, totalResults, currentPage, perPage, paginationRadius } = useHelxSearch()
  const [pageCount, setPageCount] = useState(0)
  const theme = useTheme()

  useEffect(() => {
    setPageCount(Math.ceil(totalResults / perPage))
  }, [totalResults, perPage])

  if (totalResults === 0) return null

  return (
    <Wrapper role="navigation" aria-label="Pagination Navigation">
      <PaginationLink to={ `/helx/search?q=${ query }&p=1` } icon="firstPage" disabled={ currentPage <= 1 } aria-label="Go to first page" />
      <PaginationLink to={ `/helx/search?q=${ query }&p=${ currentPage - 1 }` } icon="chevronLeft" disabled={ currentPage <= 1 } aria-label="Go to previous page"/>
      <Icon icon="ellipsis" fill={ currentPage > paginationRadius + 1 ? theme.color.grey.light : 'transparent' } size={ 24 } />
      {
        [...Array(pageCount).keys()].map(i => {
          let minPage = currentPage - paginationRadius
          let maxPage = currentPage + paginationRadius
          // we only want paginationRadius page links on either side of the current link, if possible
          // this means shifting the viewing window accordingly:
          //  page 2: [      (1), 2, 3, 4, 5, 6, 7, ... ]
          //  page 2: [      1, (2), 3, 4, 5, 6, 7, ... ]
          //  page 3: [      1, 2, (3), 4, 5, 6, 7, ... ]
          //  page 4: [      1, 2, 3, (4), 5, 6, 7, ... ]
          //  page 5: [ ..., 2, 3, 4, (5), 6, 7, 8, ... ]
          //  page 6: [ ..., 3, 4, 5, (6), 7, 8, 9, ... ]
          // and analogous behavior for pages at the end

          // are we low in the pages?
          if (currentPage <= paginationRadius) { [minPage, maxPage] = [1, 2 * paginationRadius + 1] }
          
          // are we near the end?
          if (currentPage >= pageCount - paginationRadius) { [minPage, maxPage] = [pageCount - 2 * paginationRadius, pageCount]}
          
          // omit page links outsie out viewing window
          if (i + 1 < minPage || maxPage < i + 1) {
            return null
          }
          
          return (
            <PaginationLink
              key={ `link-to-p${ i + 1 }` }
              to={ `/helx/search?q=${ query }&p=${ i + 1 }` }
              disabled={ currentPage === i + 1 }
              aria-label={ currentPage === i + 1 ? `Current page, page ${ i + 1 }` : `Go to page ${ i + 1 }` }
              aria-current={ currentPage === i + 1 }
            >
              { i + 1 }
            </PaginationLink>
          )
        })
      }
      <Icon icon="ellipsis" fill={ pageCount > 2 * paginationRadius - 1 && currentPage < pageCount - paginationRadius ? theme.color.grey.light : 'transparent' } size={ 24 } />
      <PaginationLink to={ `/helx/search?q=${ query }&p=${ currentPage + 1 }` } icon="chevronRight" disabled={ currentPage >= pageCount } aria-label="Go to next page"/>
      <PaginationLink to={ `/helx/search?q=${ query }&p=${ pageCount }` } icon="lastPage" disabled={ currentPage >= pageCount } aria-label="Go to last page"/>
    </Wrapper>
  )
}
