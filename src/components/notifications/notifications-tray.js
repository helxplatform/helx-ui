import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Notification } from './notification'
import { notificationTypes } from './notifications-context'
import { icons } from './notification-icons'

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.5rem;
`

export const NotificationsTray = ({ notifications }) => {
  return (
    <Wrapper>
      { notifications.map(message => <Notification key={ message.id } message={ message } icon={ icons[message.type] } />) }
    </Wrapper>
  )
}

NotificationsTray.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(notificationTypes).isRequired,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    text: PropTypes.string.isRequired,
  })).isRequired,
}
