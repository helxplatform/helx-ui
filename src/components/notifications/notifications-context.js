import React, { useContext, useEffect, useState } from 'react'
import { Notification } from './notification'
import { NotificationsTray } from './notifications-tray'

export const NotificationsContext = React.createContext({})

export const Notifications = ({ children }) => {
  const [queue, setQueue] = useState([])

  useEffect(() => {
    console.log(`QUEUE`)  
    console.log(queue)
  }, [queue])

  const addNotification = newMessage => {
    console.log(`adding notification: "${newMessage}"`)
    const newQueue = [ ...queue, newMessage]
    setQueue(newQueue)
  }

  return (
    <NotificationsContext.Provider value={{ addNotification }}>
      { children }
      <NotificationsTray queue={ queue } />
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationsContext)
