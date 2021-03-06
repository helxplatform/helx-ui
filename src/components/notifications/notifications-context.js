import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Notification } from './notification'
import { NotificationsTray } from './notifications-tray'

export const NotificationsContext = React.createContext({})

export const notificationTypes = ['error', 'info', 'success', 'warning']

export const Notifications = ({ children, colors }) => {
  const [queue, setQueue] = useState([])

  const addNotification = newMessage => {
    const newQueue = [ ...queue, newMessage]
    setQueue(newQueue)
  }

  const closeNotification = id => {
    const newQueue = queue.filter(message => message.id !== id)
    setQueue(newQueue)
  }

  return (
    <NotificationsContext.Provider value={{ addNotification, closeNotification, notificationColors: colors }}>
      { children }
      <NotificationsTray notifications={ queue } />
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationsContext)

Notifications.propTypes = {
  colors: PropTypes.shape({
    info: PropTypes.string.isRequired,
    success: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
    warning: PropTypes.string.isRequired,
  }).isRequired,
}

Notifications.defaultProps = {
  colors: {
    info: 'dodgerblue',
    success: 'palegreen',
    error: 'lightcoral',
    warning: 'goldenrod',
  },
}
