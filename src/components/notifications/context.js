import React, { useCallback, useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { NotificationsTray } from './tray'
import { colors, icons } from './config'

export const NotificationsContext = React.createContext({})

export const Notifications = ({ children }) => {
  const [queue, setQueue] = useState([])

  const addNotification = message => {
    const newMessage = { ...message, id: Math.random().toString(36).substr(2, 9) }
    setQueue([ ...queue, newMessage])
  }

  const closeNotification = useCallback(id => {
    setQueue(queue => queue.filter(message => message.id !== id))
  }, [])

  return (
    <NotificationsContext.Provider value={{ addNotification, closeNotification, colors, icons }}>
      { children }
      <NotificationsTray notifications={ queue } />
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationsContext)

Notifications.propTypes = {
  colors: PropTypes.shape({
    info: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
    success: PropTypes.string.isRequired,
    warning: PropTypes.string.isRequired,
  }).isRequired,
}

Notifications.defaultProps = { colors: colors }
