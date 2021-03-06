import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Notification } from './notification'
import { NotificationsTray } from './notifications-tray'
import { colors, icons, types } from './config'

export const NotificationsContext = React.createContext({})

export const Notifications = ({ children }) => {
  const [queue, setQueue] = useState([])
  const timers = useRef([])

  const addNotification = message => {
    const newMessage = { ...message, id: Math.random().toString(36).substr(2, 9) }
    console.log(`adding ${ newMessage.id }`)
    const newQueue = [ ...queue, newMessage]
    setQueue(newQueue)
  }

  const closeNotification = useCallback(id => {
    console.log(`removing ${ id }`)
    const newQueue = queue.filter(message => message.id !== id)
    setQueue(newQueue)
  }, [])

  useEffect(() => {
    console.table(queue)
  }, [queue])

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
