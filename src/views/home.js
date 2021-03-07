import React, { useState } from 'react'
import { Container } from '../components/layout'
import { Title, Heading, Paragraph } from '../components/typography'
import { useNotifications } from '../components/notifications'

export const Home = () => {
  const { addNotification } = useNotifications()
  return (
    <Container>
      <Title>Home</Title>

      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </Paragraph>

    <Heading>Add Notifications</Heading>
    
    <button onClick={() => addNotification({ type: 'info', text: 'here is some information' })}>info notification</button>
    <br /><br />
    <button onClick={() => addNotification({ type: 'info', text: 'here is some information. you must close me.', autoClose: false })}>stubborn info notification</button>
    <br /><br />
    <button onClick={() => addNotification({ type: 'error', text: 'an error occurred' })}>error notification</button>
    <br /><br />
    <button onClick={() => addNotification({ type: 'success', text: 'that was successful' })}>success notification</button>
    <br /><br />
    <button onClick={() => addNotification({ type: 'warning', text: 'be careful' })}>warning notification</button>
    <br /><br />
  </Container>
  )
}
