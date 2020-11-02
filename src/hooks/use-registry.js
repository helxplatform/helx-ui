/**
 * This returns the context from the Tycho registry
 * with its apps populated with inherited contexts' apps
 */


import { useEffect, useState } from 'react'
import registry from '../temp/registry.json'

const getApps = ctx => {
  // start with no apps
  let apps = {}

  // set context variable
  const context = registry.contexts[ctx]

  // if we don't find a matching context, return empty object
  if (!context) return apps

  // this context's apps consist of (at least) those listed explicitly in this context
  apps = { ...context.apps }

  // if this context inherits from other contexts...
  if (registry.contexts[ctx].extends) {
    // ...add any parent contexts' apps into the apps object
    registry.contexts[ctx].extends.forEach(contextName => {
      apps = { ...apps, ...registry.contexts[contextName].apps }
    })
  }
  
  // send it back
  return apps
}

export const useRegistry = contextName => {
  const [context, setContext] = useState('')

  useEffect(() => {
    const ctx = registry.contexts[contextName]

    if (!ctx) return

    setContext({ ...ctx, apps: getApps(contextName) })
  }, [contextName])

  return { context }
}