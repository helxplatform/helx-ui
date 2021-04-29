import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Container } from '../../components/layout'
import { Button } from '../../components/button'
import { useAuth, useEnvironment } from '../../contexts'
import { logoutHandler } from '../../api/';

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
  const { helxAppstoreUrl } = useEnvironment();

  return (
    <LogoutContainer>
      <Button onClick={() => logoutHandler(helxAppstoreUrl)}>Log Out</Button>
    </LogoutContainer>
  )
}
