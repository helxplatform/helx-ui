import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled, { css, keyframes } from 'styled-components'
import { useNotifications } from './notifications-context'
import { colors, icons, types } from './config'

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

const Wrapper = styled.div(({ color, icon, theme }) => css`
  background-color: white;
  border-width: 1px solid ${ color };
  cursor: pointer;
  animation: ${ fade } 150ms ease-out forwards;
  border-radius: 4px;
  transition: filter 250ms;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.2)) brightness(1.0);
  &:hover {
    filter: drop-shadow(0 0 7px rgba(0, 0, 0, 0.25)) brightness(1.1);
    & .close {
      filter: opacity(1.0);
    }
  }
  & .icon {
    background-color: ${ color };
    padding: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & .text {
    flex: 1;
    background-color: white;
    padding: 1rem;
  }
  & .close {
    transition: filter 250ms;
    filter: opacity(0.0);
    border: 0;
    color: ${ color };
  }
`)

export const Notification = ({ message }) => {
  const { closeNotification, colors, icons } = useNotifications()

  return (
    <Wrapper onClick={ () => closeNotification(message.id) } color={ colors[message.type] }>
      <div className="icon">{ icons[message.type] }</div>
      <div className="text">{ message.text }</div>
      <button className="close">&times;</button>
    </Wrapper>
  )
}

Notification.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.oneOf(types).isRequired,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
}
