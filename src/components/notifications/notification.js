import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled, { css, keyframes } from 'styled-components'
import { notificationTypes, useNotifications } from './notifications-context'

const fade = keyframes`
  0% {
    opacity: 0.0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1.0;
    transform: translateX(0);
  }
`

const Wrapper = styled.div(({ color, theme }) => css`
  background-color: ${ color };
  padding: 1rem;
  cursor: pointer;
  animation: ${ fade } 150ms ease-out forwards;
  border-radius: 4px;
  transition: filter 250ms;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.2)) brightness(1.0);
  &:hover {
    filter: drop-shadow(0 0 7px rgba(0, 0, 0, 0.25)) brightness(1.1);
  }
`)

export const Notification = ({ message }) => {
  const [closing, setClosing] = useState(false)
  const { closeNotification, notificationColors } = useNotifications()

  return (
    <Wrapper onClick={ () => closeNotification(message.id) } color={ notificationColors[message.type] }>
      { message.type } : { message.text }
    </Wrapper>
  )
}

Notification.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.oneOf(notificationTypes).isRequired,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
}
