import React from 'react'
import { useAuth } from '../../contexts'
import { Login } from './login'
import { Profile } from './profile'

export const Account = () => {
  const auth = useAuth()

  if (auth.user) {
    return <Profile />
  }
  return <Login />
}