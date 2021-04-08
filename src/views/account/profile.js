import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Container } from '../../components/layout'
import { Title, Heading, Subheading, Paragraph } from '../../components/typography'
import { List } from '../../components/list'
import { Link } from '../../components/link'
import { Button } from '../../components/button'
import { Icon } from '../../components/icon'
import { useAuth, useEnvironment } from '../../contexts'
import { Search } from '../search';


const LogoutContainer = styled(Container)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
`

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) { return Math.floor(interval) + ` years ago` }
  interval = seconds / 2592000
  if (interval > 1) { return Math.floor(interval) + ` months ago` }
  interval = seconds / 86400
  if (interval > 1) { return Math.floor(interval) + ` days ago` }
  interval = seconds / 3600
  if (interval > 1) { return Math.floor(interval) + ` hours ago` }
  interval = seconds / 60
  if (interval > 1) { return Math.floor(interval) + ` minutes ago` }
  return Math.floor(seconds) + ` seconds ago`
}

export const Profile = () => {
  const theme = useTheme()
  const auth = useAuth()
  const { helxAppstoreCsrfToken, helxAppstoreUrl } = useEnvironment();

  return (
    <LogoutContainer>
      <Button onClick={() => global.window && (global.window.location.href = `${helxAppstoreUrl}/accounts/logout/`)}>Log Out</Button>

      {/* <Heading>{ auth.user.username } ({ auth.user.email }) </Heading>

      <Button onClick={ auth.logout }>LOGOUT</Button>

      <h3>Favorite Searches ({ auth.user.search.favorites.length })</h3>

      <List items={
        auth.user.search.favorites.map(item => {
          const { query, page } = JSON.parse(item)
          const itemUrl = `/search?q=${ query }&p=${ page }`
          return (
            <div key={ `${ item.query }-${ item.page }` } style={{ display: 'flex', alignItems: 'flex-start' }}>
              <Icon icon="link" fill={ theme.color.primary.dark } size={ 14 } /> &nbsp;&nbsp;
              <Link to={ itemUrl }>
                <em>{ query }</em>, page { page }
              </Link>
            </div>
          )
        })
      } />

      <h3>Search History</h3>

      <List items={
        auth.user.search.history.map(item => {
          const { query, timestamp } = JSON.parse(item)
          const itemUrl = `/search?q=${query}`
          const relativeTime = timeSince(new Date(timestamp))
          return (
            <div key={`${timestamp}-${query}`} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <Icon icon="link" fill={theme.color.primary.dark} size={14} /> &nbsp;&nbsp;
              <Link to={itemUrl}>
                "{query}"
              </Link>
              &nbsp;&nbsp;
              <em>({relativeTime})</em>
            </div>
          )
        })
      } /> */}

    </LogoutContainer>
  )
}
