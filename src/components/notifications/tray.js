import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { types } from './config'
import { Notification } from './notification'

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 1rem);
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
`

export const NotificationsTray = ({ notifications }) => {
  return (
    <Wrapper>
      { notifications.map(message => <Notification key={ message.id } message={ message } />) }
    </Wrapper>
  )
}

NotificationsTray.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(types).isRequired,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    text: PropTypes.string.isRequired,
  })).isRequired,
}
