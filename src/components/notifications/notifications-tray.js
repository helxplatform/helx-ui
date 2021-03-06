import React, { useState } from 'react'
import styled from 'styled-components'
import { Notification } from './notification'

const Wrapper = styled.div`
  border: 1px solid red;
  position: fixed;
  bottom: 0;
  right: 0;
  width: 200px;
  padding: 1rem;
`

export const NotificationsTray = ({ queue }) => {
  return (
    <Wrapper>
      { queue.map((message, i) => <Notification key={ i } message={ message } />) }
    </Wrapper>
  )
}