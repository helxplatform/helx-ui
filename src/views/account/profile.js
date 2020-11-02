import React from 'react'
import { useTheme } from 'styled-components'
import { Container } from '../../components/layout'
import { Title, Heading, Subheading, Paragraph } from '../../components/typography'
import { List } from '../../components/list'
import { Link } from '../../components/link'
import { Button } from '../../components/button'
import { Icon } from '../../components/icon'
import { useAuth } from '../../contexts'
import { Search } from '../search';

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
  return (
    <Container>
      <Title>My Accouunt</Title>
      
      <Heading>{ auth.user.username } ({ auth.user.email }) </Heading>

      <Button onClick={ auth.logout }>LOGOUT</Button>

      <Subheading>Profile</Subheading>
      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Paragraph>

      <Subheading>Preferences</Subheading>
      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Paragraph>

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
          const itemUrl = `/search?q=${ query }`
          const relativeTime = timeSince(new Date(timestamp))
          return (
            <div key={ `${ timestamp }-${ query }` } style={{ display: 'flex', alignItems: 'flex-start' }}>
              <Icon icon="link" fill={ theme.color.primary.dark } size={ 14 } /> &nbsp;&nbsp;
              <Link to={ itemUrl }>
                "{ query }"
              </Link>
              &nbsp;&nbsp;
              <em>({ relativeTime })</em>
            </div>
          )
        })
      } />

      <Subheading>Another Section</Subheading>
      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Paragraph>
      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Paragraph>
    </Container>
  )
}
